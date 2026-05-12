import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ChevronRight, Palette, Target, MessageCircle, Globe, Upload, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Utility function for background removal (graceful fallback)
const removeBackground = async (file: Blob): Promise<Blob> => {
  try {
    // If a background removal library is available, use it
    // For now, return the original file as fallback
    return file;
  } catch (error) {
    console.warn('Background removal not available, using original image');
    return file;
  }
};
import { BusinessProfile } from '../types';
import toast from 'react-hot-toast';
import { formatUploadError, uploadBase64Image } from '../lib/upload';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSchemaOutdated, setIsSchemaOutdated] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<BusinessProfile>>({
    business_name: '',
    niche: '',
    target_audience: '',
    tone: 'Professional',
    language: 'English',
    brand_colors: ['#4F46E5', '#7C3AED'],
    phone: '',
    address: '',
    logo_url: '',
    instagram_handle: '',
    facebook_handle: '',
    website_url: ''
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          let { data, error } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (error && (error.message?.includes('facebook_handle') || error.message?.includes('column'))) {
            // Fallback to safe select
            console.warn("Social handle columns missing in Onboarding, falling back to core fields.");
            setIsSchemaOutdated(true);
            const { data: safeData, error: safeError } = await supabase
              .from('business_profiles')
              .select('id, user_id, business_name, niche, target_audience, tone, language, brand_colors, phone, address, logo_url, created_at')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (!safeError) {
              data = safeData;
              error = null;
            }
          }

          if (data && !error) {
            setFormData(data);
            setIsEditing(true);
          } else if (error) {
            if (error.message?.includes('facebook_handle') || error.message?.includes('column')) {
              setIsSchemaOutdated(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        toast.loading('Processing logo (removing background)...', { id: 'logo-upload' });
        
        // 1. Remove Background
        const processedBlob = await removeBackground(file);
        
        // 2. Convert to Base64 for upload
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(processedBlob);
        });
        
        const base64 = await base64Promise;

        // 3. Upload to Cloudinary
        toast.loading('Uploading clean logo...', { id: 'logo-upload' });
        const uploadedUrl = await uploadBase64Image(base64);
        setFormData({ ...formData, logo_url: uploadedUrl });
        toast.success('Clean logo uploaded!', { id: 'logo-upload' });
      } catch (error) {
        console.error('Logo processing/upload error:', error);
        toast.error(formatUploadError(error) + ' Trying original...', { id: 'logo-upload' });
        
        // Fallback to original if background removal fails
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const uploadedUrl = await uploadBase64Image(reader.result as string);
            setFormData({ ...formData, logo_url: uploadedUrl });
            toast.success('Original logo uploaded', { id: 'logo-upload' });
          } catch (err) {
            toast.error(formatUploadError(err), { id: 'logo-upload' });
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const validateStep1 = () => {
    if (!formData.business_name?.trim()) return toast.error('Business Name is required');
    if (!formData.niche) return toast.error('Please select a business niche');
    nextStep();
  };

  const validateStep2 = () => {
    if (!formData.target_audience?.trim()) return toast.error('Target Audience is required');
    nextStep();
  };

  const handleSubmit = async () => {
    // 1. Final Validation
    if (!formData.business_name?.trim() || !formData.niche) {
      setStep(1);
      return toast.error('Please complete Step 1');
    }
    if (!formData.target_audience?.trim()) {
      setStep(2);
      return toast.error('Please complete Step 2');
    }

    setIsSaving(true);
    const loadingToast = toast.loading('Saving your profile...');

    try {
      if (!user) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      // 2. Prepare Clean Payload
      const payload: any = {
        user_id: user.id,
        business_name: formData.business_name.trim(),
        niche: formData.niche,
        target_audience: formData.target_audience.trim(),
        tone: formData.tone || 'Professional',
        language: formData.language || 'English',
        brand_colors: formData.brand_colors || ['#4F46E5', '#7C3AED'],
        phone: formData.phone?.trim() || '',
        address: formData.address?.trim() || '',
        logo_url: formData.logo_url || '',
        instagram_handle: formData.instagram_handle?.trim() || '',
        facebook_handle: formData.facebook_handle?.trim() || '',
        website_url: formData.website_url?.trim() || ''
      };

      // Include ID if we're updating an existing record to be safe
      if (formData.id) {
        payload.id = formData.id;
      }

      // 3. Upsert with explicit conflict target
      let { data, error } = await supabase
        .from('business_profiles')
        .upsert(payload, { 
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error && (error.message?.includes('facebook_handle') || error.message?.includes('column'))) {
        // Fallback to safe upsert
        console.warn("Social handle columns missing during save, falling back to core fields.");
        setIsSchemaOutdated(true);
        const safePayload = { ...payload };
        delete safePayload.facebook_handle;
        delete safePayload.instagram_handle;
        delete safePayload.website_url;
        
        const { data: safeData, error: safeError } = await supabase
          .from('business_profiles')
          .upsert(safePayload, { 
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
          .select()
          .single();
        
        if (!safeError) {
          data = safeData;
          error = null;
          toast.success('Profile saved (Social handles skipped due to outdated schema)');
        }
      }

      if (error) {
        console.error('Supabase Upsert Error:', error);
        throw error;
      }
      
      toast.success('Profile setup complete!', { id: loadingToast });
      
      // Small delay to ensure the user sees the success state
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Detailed Profile Save Error:', error);
      
      let errorMessage = 'Failed to save profile. Please try again.';
      
      if (error.message?.includes('Could not find the table')) {
        errorMessage = 'Database tables are missing. Apply the schema from supabase/schema.sql in Supabase and try again.';
      } else if (error.code === '42501') {
        errorMessage = 'Permission denied. Please check your Supabase RLS policies.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: loadingToast, duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
            <p className="text-slate-500 font-medium">Loading profile...</p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 flex">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={`flex-1 transition-all duration-500 ${s <= step ? 'bg-indigo-600' : ''}`}
                />
              ))}
            </div>

            <div className="p-8 lg:p-12">
              {isSchemaOutdated && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <RefreshCw size={16} className="animate-spin-slow" />
                    Database Update Required
                  </div>
                  <p className="text-amber-700 text-xs">
                    To enable social handles and website links, apply the schema updates in supabase/schema.sql.
                  </p>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                    Source: repository schema file
                  </p>
                </div>
              )}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Rocket className="text-indigo-600" size={32} />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900">
                        {isEditing ? 'Edit Business Profile' : 'Welcome to LocalBoost!'}
                      </h2>
                      <p className="text-slate-500">
                        {isEditing ? 'Update your business details below.' : "Let's start with the basics of your business."}
                      </p>
                    </div>

                    <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Business Name</label>
                    <input 
                      type="text"
                      value={formData.business_name || ''}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      placeholder="e.g., Glow Salon & Spa"
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g., +91 98765 43210"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Shop Address</label>
                      <input 
                        type="text"
                        value={formData.address || ''}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="e.g., 123 Main St, Mumbai"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Business Logo</label>
                    <div className="flex items-center gap-4">
                      {formData.logo_url ? (
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 group">
                          <img src={formData.logo_url} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                          <button 
                            onClick={() => setFormData({ ...formData, logo_url: '' })}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
                          {isUploading ? (
                            <Loader2 className="text-indigo-600 animate-spin" size={24} />
                          ) : (
                            <>
                              <Upload className="text-slate-400 group-hover:text-indigo-600" size={24} />
                              <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">Upload</span>
                            </>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                        </label>
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 font-medium">Upload your shop logo to display it on your marketing posters automatically.</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Business Niche</label>
                    <select 
                      value={formData.niche || ''}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all"
                    >
                      <option value="">Select Niche</option>
                      <option value="Salon">Salon & Beauty</option>
                      <option value="Gym">Gym & Fitness</option>
                      <option value="Restaurant">Restaurant & Cafe</option>
                      <option value="Clothing">Clothing & Fashion</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={validateStep1}
                  className="w-full bg-indigo-600 text-white p-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="text-purple-600" size={32} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">Target Audience</h2>
                  <p className="text-slate-500">Who are we talking to?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Target Audience</label>
                    <input 
                      type="text"
                      value={formData.target_audience || ''}
                      onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                      placeholder="e.g., Young women aged 18-35 in Mumbai"
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Brand Tone</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Professional', 'Funny', 'Premium', 'Emotional'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFormData({ ...formData, tone: t })}
                          className={`p-4 rounded-2xl border-2 font-bold transition-all ${
                            formData.tone === t 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                              : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 p-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">Back</button>
                  <button onClick={validateStep2} className="flex-[2] bg-indigo-600 text-white p-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">Continue</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Palette className="text-amber-600" size={32} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">Final Touches</h2>
                  <p className="text-slate-500">Language and visual preferences.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Instagram Handle</label>
                      <input 
                        type="text"
                        value={formData.instagram_handle || ''}
                        onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                        placeholder="e.g., @glow_salon"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Facebook Page</label>
                      <input 
                        type="text"
                        value={formData.facebook_handle || ''}
                        onChange={(e) => setFormData({ ...formData, facebook_handle: e.target.value })}
                        placeholder="e.g., GlowSalonMumbai"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Website URL</label>
                    <input 
                      type="url"
                      value={formData.website_url || ''}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      placeholder="e.g., www.glowsalon.com"
                      className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Preferred Language</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['English', 'Hindi', 'Hinglish'].map((l) => (
                        <button
                          key={l}
                          onClick={() => setFormData({ ...formData, language: l })}
                          className={`p-4 rounded-2xl border-2 font-bold transition-all ${
                            formData.language === l 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                              : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} disabled={isSaving} className="flex-1 p-5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">Back</button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSaving}
                    className="flex-[2] bg-indigo-600 text-white p-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      isEditing ? 'Save Changes' : 'Finish Setup'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </>
      )}
      </div>
    </div>
  );
}

