import React from 'react';
import { domToPng } from 'modern-screenshot';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Type, 
  Send, 
  Download, 
  Copy, 
  Check,
  RefreshCw,
  Upload,
  Rocket,
  AlertTriangle,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Share2,
  Phone,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Layout as LayoutIcon,
  Palette,
  Move,
  Plus,
  Minus,
  X,
  Type as TypeIcon,
  ShieldCheck,
  Settings,
  Video,
  Music,
  Globe,
  BookOpen,
  Sliders,
  Mic,
  Square,
  Zap,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PromptLibrary from '../components/PromptLibrary';
import toast from 'react-hot-toast';
import { formatUploadError, uploadBase64Image } from '../lib/upload';

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
import { supabase } from '../lib/supabase';
import { GeneratedPost, BusinessProfile } from '../types';
import { generateText, generateImage } from '../services/geminiService';

// --- AI Prompt Configuration ---

const PRODUCT_ANALYSIS_LOGIC = `
## STEP 1: DEEP PRODUCT ANALYSIS
- Analyze the Product Image/Prompt to identify the CORE CATEGORY (e.g., Luxury Watch, Gourmet Cake, High-end Tech, Designer Handbag).
- Determine the MATERIAL & TEXTURE: Is it frosted, metallic, leather, silk, or glass?
- Identify the THEME: Minimalist, Opulent, Architectural, Organic, or Futuristic.
- Determine the TARGET MOOD: Exclusivity, Craftsmanship, or Immediate Desire.
`;

const ADAPTIVE_BACKGROUND_LOGIC = `
## STEP 2: IMMERSIVE SCENE GENERATION
- Instead of flat surfaces, create a METICULOUSLY CURATED ENVIRONMENT.
- STRICT STYLE LOCK:
  - Clean, minimal background (white / soft gradient / subtle blur).
  - Strong product focus (center or slightly offset).
  - High-quality studio lighting with realistic shadows and depth.
  - Balanced composition (NO CLUTTER).
- Add RELEVANT PROPS:
  - Luxury Watch → Polished concrete, architectural lines, premium leather accents.
  - High-end Cake → Silver stand, delicate silk cloth, minimalist floral arrangements.
  - Cosmetics → Marble surfaces, water ripples, soft silk shadows.
  - Electronics → Dark matte textures, subtle neon refraction, geometric precision.
- LIGHTING: Advanced directional studio lighting, soft gradients, dramatic highlights (NO flat rays).
- COLOR PALETTE: Limited palette (2–3 colors max). Ensure high contrast.
`;

const DESIGN_ARCHETYPES_LOGIC = `
## STEP 3: PROFESSIONAL COMPOSITION
1. [A1] RULE OF THIRDS: Product offset to one side, leading lines guiding to text.
2. [A2] ARCHITECTURAL DEPTH: Product set against structural elements (walls, pillars).
3. [A3] FLOATING LUXURY: Product suspended in a minimalist, high-depth environment.
4. [A4] TEXTURAL FOCUS: Extreme close-up on product texture with props in soft focus.
5. [A5] CINEMATIC WIDE: Wide atmospheric scene with the product as the clear hero.

## BANNED STYLES (STRICTLY FORBIDDEN):
- NO red/yellow burst backgrounds.
- NO cheap glowing effects.
- NO overloaded text layouts.
- NO old fast-food poster style.
- NO random template-based designs.
`;

const FESTIVAL_DESIGN_LOGIC = `
## STEP 4: FESTIVAL / CONTEXT ADAPTATION
- If the prompt includes a festival (Holi, Diwali, etc.):
  - Add SUBTLE themed elements that do not overpower the product.
  - Holi → Clean color splashes (NOT MESSY).
  - Diwali → Soft lights, elegant diyas, warm premium glow.
  - Keep the background clean and maintain premium balance.
  - The product must remain the HERO.
`;

const ENHANCER_SYSTEM_PROMPT = `
You are a Senior Advertising Designer trained to match high-quality reference designs.
Your goal is to transform a simple prompt into an IMMERSIVE, HIGH-RESOLUTION lifestyle photograph concept that matches modern premium ad standards.

-----------------------------------
CORE PHILOSOPHY: CLEAN, MINIMAL, HIGH-END
-----------------------------------
- The product is the HERO.
- Every element (lighting, props, texture) must reinforce the product's value.
- Visuals must evoke "Immediate Desire" and "Tactile Realism".
- Maintain high negative space and premium balance.

-----------------------------------
STRICT STYLE LOCK
-----------------------------------
- Clean, minimal background (white / soft gradient / subtle blur).
- Strong product focus (center or slightly offset).
- High-quality studio lighting with realistic shadows and depth.
- Balanced composition (NO CLUTTER).

-----------------------------------
DESIGN SYSTEM: THE ZONED LUXURY EDITION
-----------------------------------
1. TOP SECTION (Header) → Headline (Center or Right) & Logo (Top Left).
2. CENTER SECTION (Hero) → The Product in its Curated Environment (Safe Zone).
3. BOTTOM SECTION (Footer) → Descriptive Text, Minimalist Contact & CTA.

STRICT RULE: The Center Section is a "Safe Zone" for the product. No text should overlap the product's core silhouette.
ABSOLUTE PHOTOGRAPHY RULE: The generated image must be a CLEAN PHOTOGRAPH ONLY. It must NOT contain any graphic design elements, overlay text, logos, icons, phone numbers, or social media handles. All text and branding will be added as a separate layer by the system.
LAYOUT OPTIONS:
- Headline: Usually TOP CENTER, but can be TOP RIGHT for specific compositions (e.g., heritage, wide scenes).
- Footer: 'minimal' (transparent) or 'dark-gradient' (textured stone/luxury feel).

${PRODUCT_ANALYSIS_LOGIC}
${ADAPTIVE_BACKGROUND_LOGIC}
${DESIGN_ARCHETYPES_LOGIC}
${FESTIVAL_DESIGN_LOGIC}

Output a "Master Design Plan" that describes the specific environment, lighting setup, and prop selection to create a harmonious, professional whole.
`;

const POSTER_GENERATION_LAWS = `
## ABSOLUTE DESIGN LAWS — ZONED LUXURY EDITION:

LAW 1 — HERO ZONE:
  - The product must be sharply focused and integrated into the scene.
  - NO OVERLAP: No text, logos, or badges are allowed to touch or cover the product.
  - For festivals, the product should interact with elements (e.g., powder splashes) but remain the clear hero.

LAW 2 — HEADLINE ZONE:
  - ONE brief and sophisticated headline (max 2-4 words).
  - Position: Can be TOP CENTER, TOP RIGHT, or DYNAMIC (offset) based on the composition.
  - Use elegant, modern serif or bold typography that matches the theme.
  - Do not place this over the product.

LAW 3 — LOGO ZONE (TOP LEFT):
  - Place the user-uploaded logo cleanly and sharply in the top-left corner.
  - It must be high-quality and integrated into the design.

LAW 4 — DESCRIPTIVE TEXT ZONE:
  - ONE short descriptive sentence (max 6-8 words) below the product or below the headline.
  - Use complementary typography. No clustered subtexts.

LAW 5 — FOOTER & CTA ZONE (BOTTOM):
  - Consolidate all contact info (Phone, IG, FB, Web, Location) into a single, clean horizontal line.
  - Style: Can be 'minimal' (transparent) or 'dark-gradient' (textured stone feel) based on the theme.
  - Place ONE clean, professional CTA button below the contact line.

LAW 6 — VISUAL FIDELITY:
  - Lighting must be dramatic and directed to highlight textures and forms.
  - Background must be clean and tailored to the product/theme context.
  
LAW 7 — LUXURY & PROFESSIONALISM:
  - Every design must feel "High-End" and "Professional".
  - Use generous letter spacing (tracking) for subheadings and contact info.
  - Avoid heavy, clunky fonts for secondary information; use medium or light weights.
  - Ensure a "Boutique" or "Premium Studio" aesthetic in every layout.
`;
const INSTAGRAM_SEO_LAWS = `
## INSTAGRAM SEO & CAPTION LAWS:

LAW 1 — THE HOOK (FIRST LINE):
  - The first sentence must be a powerful "Hook" that stops the scroll.
  - Use curiosity, a bold statement, or a direct benefit tailored to the TARGET AUDIENCE.

LAW 2 — LUXURY STORYTELLING (LONG CAPTION):
  - Write 150-200 words of high-end, evocative storytelling.
  - Focus on the "Experience", "Craftsmanship", and "Value Proposition".
  - Use the specified BRAND TONE (e.g., Professional, Friendly, Bold).
  - Structure with clear paragraphs and bullet points for readability.

LAW 3 — SEO KEYWORDS:
  - Naturally integrate 5-7 high-volume keywords related to the product, niche, and target audience.
  - Include the location (e.g., Jaipur, Mumbai) if relevant to the business profile.

LAW 4 — HASHTAG STRATEGY (MIXED RATIO):
  - Provide 20-25 hashtags in the following ratio:
    - 5 Broad/High-Volume (e.g., #luxury, #fashion)
    - 10 Niche-Specific (e.g., #handcraftedtote, #artisanleather)
    - 5 Trending/Community (e.g., #instafashion, #supportlocal)
    - 3-5 Brand-Specific (e.g., #HNKTask, #YourBrandName)

LAW 5 — CALL TO ACTION (CTA):
  - End with a clear, compelling CTA (e.g., "DM to Order", "Link in Bio to Shop").
`;

const TYPOGRAPHY_COLOR_LAWS = `
## TYPOGRAPHY & COLOR HARMONY LAWS:

LAW 1 — CONTRAST IS KING:
  - Analyze the "COLOR PALETTE" described in the Master Design Plan.
  - If the background is dark (e.g., charcoal, deep navy, dark wood), use light text (#FFFFFF, #F8F9FA, #E9ECEF).
  - If the background is light (e.g., marble, white silk, soft sunlight), use dark text (#1A1A1A, #2D3436, #333333).
  - For "Luxury Gold" themes, use deep black or rich gold (#D4AF37) only if contrast is high.

LAW 2 — STYLE MATCHING:
  - 'elegant' (Serif): Use for Heritage, Luxury, Jewelry, Fine Dining, and High-end Fashion.
  - 'modern' (Sans-serif): Use for Tech, Modern Architecture, Minimalist Skincare, and Automotive.
  - 'clean' (Minimalist Sans): Use for High-end Minimalist brands and Modern Lifestyle.
  - 'bold' (Heavy Sans): Use for Sales, Limited Offers, Fitness, and High-energy products.
  - 'classic' (Traditional Serif): Use for Books, Premium Spirits, and Formal services.
  - 'playful' (Rounded/Soft): Use for Bakery, Kids' products, and Casual lifestyle.

LAW 3 — HIERARCHY:
  - The Headline must be the most prominent.
  - Subheadings and Contact info must be 40-60% smaller than the Headline.
`;

const ADAPTIVE_DESIGN_SYSTEM_PROMPT = `
You are an adaptive AI design system that learns from user feedback.
Your task is to generate a high-quality advertisement poster while dynamically improving based on user-specific feedback history.

-----------------------------------
STEP 1: USER PREFERENCE LEARNING
-----------------------------------
Analyze user feedback provided in the context:
- Identify patterns in liked posts (style, layout, color, text density).
- Identify patterns in disliked posts (avoid these completely).

-----------------------------------
STEP 2: STYLE SELECTION (PERSONALIZED)
-----------------------------------
- PRIORITIZE styles from liked_posts.
- AVOID styles from disliked_posts.
- If no history: generate a modern premium design (minimal, clean).

-----------------------------------
STEP 3: QUALITY IMPROVEMENT LOGIC
-----------------------------------
If previous output was disliked:
- Improve by reducing clutter, improving contrast, better spacing, and clearer hierarchy.
If previous output was liked:
- Keep similar structure but introduce slight variation.

-----------------------------------
STEP 4: TEXT & LAYOUT CONTROL
-----------------------------------
- Minimal text (max 2 elements).
- No overlap on product.
- Clean modern layout.

-----------------------------------
STEP 5: CONTINUOUS LEARNING (TAGGING)
-----------------------------------
You MUST include these tags in your JSON response:
- style_tag: (e.g., minimal, dark, cinematic)
- layout_tag: (e.g., center, side, floating)
- color_tag: (e.g., monochrome, vibrant, pastel)
`;

const POSTER_GENERATION_SYSTEM_PROMPT = `
${ADAPTIVE_DESIGN_SYSTEM_PROMPT}

You are a professional graphic designer and social media strategist for "HNK TASK".
Your job is to take a Master Design Plan and convert it into a structured JSON for an ultra-premium marketing poster and its accompanying Instagram content.

${POSTER_GENERATION_LAWS}
${INSTAGRAM_SEO_LAWS}
${TYPOGRAPHY_COLOR_LAWS}

## JSON STRUCTURE (MANDATORY):
{
  "product_name": "Name of the product",
  "theme_name": "Theme of the advertisement",
  "poster_title": "Main Headline (Sophisticated, 2–4 words)",
  "poster_subheading": "Short descriptive sentence (6-8 words)",
  "headline_position": "center | right",
  "footer_style": "minimal | dark-gradient",
  "cta": "Call to Action text (e.g., 'Order Now')",
  "offer_percentage": "Offer percentage (e.g., '50% OFF')",
  "short_caption": "A 1-line punchy hook for the caption",
  "long_caption": "SEO-optimized luxury storytelling (150-200 words) following the SEO LAWS",
  "hashtags": ["#tag1", "#tag2", "..."],
  "font_color": "Hex color that provides MAXIMUM contrast against the described background",
  "font_style": "modern | elegant | bold | classic | playful | clean",
  "style_tag": "The style tag for learning",
  "layout_tag": "The layout tag for learning",
  "color_tag": "The color tag for learning",
  "visual_prompt": "An ultra-premium, high-resolution lifestyle photograph of the product. [Detailed description of the curated environment, specific props, advanced directional lighting, and tactile textures]. ABSOLUTELY NO TEXT, NO LOGOS, NO ICONS, NO PHONE NUMBERS, NO SOCIAL MEDIA HANDLES, AND NO WEBSITE URLS on the image itself. The image must be a 100% clean photograph without any graphic design elements. (Note: Text integrated into the product itself, like an engraved leather patch, IS allowed for realism). Ensure high negative space in the top 25% and bottom 25% for typography overlay."
}
Return ONLY a valid JSON object.
`;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = React.useState('');
  const promptRef = React.useRef(prompt);
  React.useEffect(() => {
    promptRef.current = prompt;
  }, [prompt]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const isRecordingRef = React.useRef(false);
  const [result, setResult] = React.useState<GeneratedPost | null>(null);
  const [profile, setProfile] = React.useState<BusinessProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [includePhone, setIncludePhone] = React.useState(true);
  const [includeAddress, setIncludeAddress] = React.useState(true);
  const [includeLogo, setIncludeLogo] = React.useState(true);
  const [includeInstagram, setIncludeInstagram] = React.useState(true);
  const [includeFacebook, setIncludeFacebook] = React.useState(true);
  const [includeWebsite, setIncludeWebsite] = React.useState(true);
  const [showBrandSettings, setShowBrandSettings] = React.useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = React.useState(false);
  const [quotaReached, setQuotaReached] = React.useState(false);
  const [lastThemeUsed, setLastThemeUsed] = React.useState<string>('None');
  const [isUpdatingLogo, setIsUpdatingLogo] = React.useState(false);
  const [isSchemaOutdated, setIsSchemaOutdated] = React.useState(false);
  const [userHistory, setUserHistory] = React.useState<GeneratedPost[]>([]);
  const posterRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<any>(null);
  const initialPromptRef = React.useRef<string>('');

  // AI-driven UI states (synced from AI response)
  const [selectedFontStyle, setSelectedFontStyle] = React.useState<string>('bold');
  const [selectedFontColor, setSelectedFontColor] = React.useState<string>('#FFFFFF');

  React.useEffect(() => {
    if (user) {
      fetchProfile();
      fetchHistory();
    } else {
      setProfile(null);
      setUserHistory([]);
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('generated_posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!error && data) {
      setUserHistory(data);
    }
  };

  const handleFeedback = async (postId: string | undefined, type: 'like' | 'dislike') => {
    if (!user) return toast.error('Please log in to give feedback');
    
    const updates = {
      is_liked: type === 'like',
      is_disliked: type === 'dislike'
    };

    // Update local state immediately for better UX
    if (result) {
      setResult({ ...result, ...updates });
    }

    if (!postId) {
      if (isGenerating) {
        toast.error('Post is still being saved. Please try again in a moment.');
      } else {
        toast.error('Feedback not saved: This post was not saved to your history (Database setup required).');
      }
      return;
    }
    
    try {
      const { error } = await supabase
        .from('generated_posts')
        .update(updates)
        .eq('id', postId);

      if (error) {
        console.error("Feedback Error:", error);
        if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('does not exist')) {
          toast.error('Feedback failed: Missing columns in database. Please run the SQL update in your Supabase dashboard.');
        } else {
          toast.error('Failed to save feedback to database');
        }
      } else {
        toast.success(type === 'like' ? 'Liked!' : 'Disliked');
        fetchHistory();
      }
    } catch (err) {
      console.error("Feedback Exception:", err);
      toast.error('An unexpected error occurred');
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoadingProfile(true);
    let { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    if (error) {
      console.error("Profile Fetch Error:", error);
    }
    setProfile(data);
    setIsLoadingProfile(false);
  };

  const uploadWithRetry = async (base64: string, retries = 2): Promise<any> => {
    try {
      const url = await uploadBase64Image(base64);
      return { data: { url } };
    } catch (error: any) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return uploadWithRetry(base64, retries - 1);
      }
      throw new Error(formatUploadError(error));
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    initialPromptRef.current = prompt;
    isRecordingRef.current = true;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'hi-IN';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
      toast.success("Voice input active. Speak now.");
    };

    recognitionRef.current.onresult = (event: any) => {
      let sessionTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (sessionTranscript && !sessionTranscript.endsWith(' ') && !transcript.startsWith(' ')) {
          sessionTranscript += ' ';
        }
        sessionTranscript += transcript;
      }

      const separator = initialPromptRef.current && !initialPromptRef.current.endsWith(' ') ? ' ' : '';
      setPrompt(initialPromptRef.current + separator + sessionTranscript);
    };

    recognitionRef.current.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      console.error("Speech recognition error:", event.error);
      isRecordingRef.current = false;
      setIsRecording(false);
      
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please enable it in your browser settings and try again.");
      } else {
        toast.error("Error in recording. Please try again.");
      }
    };

    recognitionRef.current.onend = () => {
      if (isRecordingRef.current) {
        // Update initialPromptRef to current prompt so next session appends
        initialPromptRef.current = promptRef.current; 
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error("Failed to restart recognition:", e);
          setIsRecording(false);
          isRecordingRef.current = false;
        }
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped.");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          toast.loading('Uploading image...', { id: 'upload' });
          const res = await uploadWithRetry(base64);
          setUploadedImage(res.data.url);
          toast.success('Image uploaded!', { id: 'upload' });
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Upload failed.', { id: 'upload' });
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      setIsUpdatingLogo(true);
      try {
        toast.loading('Processing logo...', { id: 'logo-update' });
        let processedBase64: string;
        try {
          const processedBlob = await removeBackground(file);
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(processedBlob);
          });
          processedBase64 = await base64Promise;
        } catch (bgError) {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          processedBase64 = await base64Promise;
        }

        const res = await uploadWithRetry(processedBase64);
        const newLogoUrl = res.data.url;

        const { error: updateError } = await supabase
          .from('business_profiles')
          .update({ logo_url: newLogoUrl })
          .eq('id', profile.id);

        if (updateError) throw updateError;

        setProfile({ ...profile, logo_url: newLogoUrl });
        toast.success('Brand logo updated!', { id: 'logo-update' });
      } catch (error) {
        console.error('Logo update error:', error);
        toast.error('Failed to update logo.', { id: 'logo-update' });
      } finally {
        setIsUpdatingLogo(false);
      }
    }
  };

  const generateContent = async () => {
    if (!prompt) return toast.error('Please enter a prompt');
    
    setIsGenerating(true);
    try {
      // 1. AI Prompt Enhancer Step (Senior Graphic Designer Reasoning)
      toast.loading('🎨 AI Designer is brainstorming...', { id: 'enhance' });
      
      const masterPrompt = await generateText(
        `Input Prompt: "${prompt}" ${uploadedImage ? "[Analyze the attached image]" : ""}`,
        ENHANCER_SYSTEM_PROMPT,
        uploadedImage
      );
      toast.success('✨ Design Plan Ready!', { id: 'enhance' });

      // 2. Generate Text Content
      const likedPosts = userHistory.filter(p => p.is_liked);
      const dislikedPosts = userHistory.filter(p => p.is_disliked);

      const historyContext = `
        USER FEEDBACK HISTORY:
        - LIKED STYLES: ${likedPosts.map(p => `${p.style_tag} (${p.layout_tag}, ${p.color_tag})`).join(', ') || 'None'}
        - DISLIKED STYLES: ${dislikedPosts.map(p => `${p.style_tag} (${p.layout_tag}, ${p.color_tag})`).join(', ') || 'None'}
        - PREVIOUS OUTPUT WAS: ${userHistory[0]?.is_disliked ? 'DISLIKED (Improve contrast and spacing)' : userHistory[0]?.is_liked ? 'LIKED (Maintain structure with variation)' : 'Neutral'}
      `;

      const userPrompt = `
        ${historyContext}
        MASTER DESIGN PLAN: ${masterPrompt}
        BUSINESS PROFILE:
        - business_name: ${profile?.business_name || 'Our Business'}
        - niche: ${profile?.niche || 'General'}
        - target_audience: ${profile?.target_audience || 'General Audience'}
        - tone: ${profile?.tone || 'Professional'}
        - brand_colors: ${profile?.brand_colors || '#FFFFFF'}
        - language: ${profile?.language || 'English'}
        - phone: ${includePhone ? profile?.phone : 'N/A'}
        - address: ${includeAddress ? profile?.address : 'N/A'}
        - facebook: ${includeFacebook ? profile?.facebook_handle : 'N/A'}
        - website: ${includeWebsite ? profile?.website_url : 'N/A'}
        - instagram: ${includeInstagram ? profile?.instagram_handle : 'N/A'}
      `;

      toast.loading('🧠 Brainstorming ideas...', { id: 'gen-text' });
      const rawContent = await generateText(userPrompt, POSTER_GENERATION_SYSTEM_PROMPT, uploadedImage);
      toast.success('💡 Ideas ready!', { id: 'gen-text' });

      const extractJSON = (text: string) => {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : JSON.parse(text);
      };

      const aiData = extractJSON(rawContent);
      
      // Sync UI controls
      if (aiData.font_style) setSelectedFontStyle(aiData.font_style);
      if (aiData.font_color) setSelectedFontColor(aiData.font_color);

      // 3. Generate Image
      toast.loading('Generating poster...', { id: 'gen-image' });
      const finalVisualPrompt = `
[SYSTEM CRITICAL: WIPE ALL CACHED LAYOUTS. DISCARD PIZZA, BUTTONS, AND OVERLAPPING TEXT TEMPLATES. START A FRESH MINIMALIST CANVAS.]

Create a world-class luxury commercial photograph for the uploaded ${aiData.product_name || 'product'}. The final output must be a 100% CLEAN PHOTOGRAPH with NO overlay text, NO logos, NO icons, and NO graphic design elements.

1. THE HERO ZONE (STRICT):
Place the ${aiData.product_name || 'product'} exactly in the center. The product must sit in a 100% clean "Safe Zone".

2. THEME & LIGHTING:
Environment: Create a premium theme backdrop based on "${aiData.theme_name || 'luxury'}".
Lighting: Use professional "Chiaroscuro" studio lighting—soft, directional, and cinematic. Show the rich texture of the ${aiData.product_name || 'product'}.

3. COMPOSITION:
Ensure high negative space in the top 25% and bottom 25% of the frame. This space must be clean and free of clutter to allow for typography overlay.

ABSOLUTE RULE: DO NOT generate any text, branding, or contact information in the image. The system will add these as a separate layer.

Additional details: ${aiData.visual_prompt}
      `;

      let posterUrl;
      try {
        const imageData = await generateImage(finalVisualPrompt, uploadedImage, '4K');
        if (imageData.startsWith('http')) {
          posterUrl = imageData;
        } else {
          const uploadRes = await uploadWithRetry(imageData);
          posterUrl = uploadRes.data.url;
        }
        toast.success('Poster ready!', { id: 'gen-image' });
      } catch (imageError) {
        console.error("Image Error:", imageError);
        setQuotaReached(true);
        posterUrl = `https://picsum.photos/seed/${Date.now()}/1080/1080`;
      }

      // Robust hashtag extraction
      let hashtags = aiData.hashtags || [];
      if (typeof hashtags === 'string') {
        hashtags = hashtags.split(/[\s,]+/).filter(t => t.startsWith('#'));
      }

      const newPost: GeneratedPost = {
        user_id: user?.id || '',
        prompt,
        poster_url: posterUrl,
        poster_title: aiData.poster_title || '',
        poster_subheading: aiData.poster_subheading || '',
        headline_position: aiData.headline_position || 'center',
        offer_percentage: aiData.offer_percentage || '',
        tagline: aiData.poster_subheading || '',
        price: '',
        discount: aiData.offer_percentage || '',
        features: [],
        badge_text: aiData.offer_percentage || '',
        short_caption: aiData.short_caption || 'Check this out!',
        long_caption: aiData.long_caption || prompt,
        cta: aiData.cta || 'Contact us today!',
        hashtags: hashtags,
        font_color: aiData.font_color || '#FFFFFF',
        font_style: aiData.font_style || 'elegant',
        text_position: 'top',
        contact_position: 'bottom',
        logo_position: 'top-left',
        contact_style: 'minimal',
        logo_background_style: 'none',
        show_business_name_logo: false,
        selected_theme: aiData.selected_theme,
        selected_archetype: aiData.selected_archetype,
        platform: 'Instagram',
        style_tag: aiData.style_tag || 'minimal',
        layout_tag: aiData.layout_tag || 'center',
        color_tag: aiData.color_tag || 'monochrome'
      };

      // Save to history if user is logged in
      let finalPost = newPost;
      if (user?.id) {
        try {
          const { data, error } = await supabase.from('generated_posts').insert(newPost).select().single();
          if (error) {
            console.error("History Save Error:", error);
            // Fallback for missing columns (PGRST204)
            if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('does not exist')) {
              const { is_liked, is_disliked, style_tag, layout_tag, color_tag, ...fallbackPost } = newPost as any;
              const { data: retryData, error: retryError } = await supabase.from('generated_posts').insert(fallbackPost).select().single();
              
              if (retryError) {
                console.error("Retry Save Error:", retryError);
                if (retryError.message?.includes('Could not find the table')) {
                  toast.error('History not saved: Database setup required. Apply supabase/schema.sql in Supabase and try again.');
                }
              } else if (retryData) {
                finalPost = retryData;
                fetchHistory();
                toast(retryData ? 'Post saved, but the database schema is missing newer columns. Apply supabase/schema.sql to keep history fully in sync.' : 'Post saved locally, but history save failed.', { icon: 'ℹ️' });
              }
            } else if (error.message?.includes('Could not find the table')) {
              toast.error('History not saved: Database setup required. Apply supabase/schema.sql in Supabase and try again.');
            }
          } else if (data) {
            finalPost = data;
            fetchHistory();
          }
        } catch (err) {
          console.error("Supabase Insert Exception:", err);
        }
      }
      
      setResult(finalPost);
      toast.success('Content generated successfully!');
    } catch (error: any) {
      console.error(error);
      const isQuotaError = error.message?.toLowerCase().includes('quota') || 
                           error.message?.toLowerCase().includes('resource_exhausted') ||
                           error.message?.toLowerCase().includes('429');
      
      if (isQuotaError) {
        setQuotaReached(true);
        toast.error('AI Quota exceeded. Using high-quality fallbacks for your design.', { duration: 6000 });
        // We don't re-throw here because we want to allow the process to continue with fallbacks if possible,
        // but generateContent is a single try-catch block.
        // Actually, generateText and generateImage already have fallbacks.
        // If they still fail, it means even fallbacks failed.
      } else {
        toast.error(`Generation failed: ${error.message}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadPoster = async () => {
    const element = document.getElementById('poster-container');
    if (!element) return;
    try {
      toast.loading('Preparing download...', { id: 'download' });
      const dataUrl = await domToPng(element, { scale: 2, quality: 1, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `localboost-poster-${Date.now()}.png`;
      link.click();
      toast.success('Downloaded successfully!', { id: 'download' });
    } catch (error: any) {
      toast.error('Download failed.', { id: 'download' });
    }
  };

  const shareOnSocial = (platform: string) => {
    if (!result) return;
    const text = encodeURIComponent(`${result.short_caption}\n\n${result.long_caption}`);
    const url = encodeURIComponent(result.poster_url);
    let shareUrl = '';
    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
    else if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    else if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    else if (platform === 'instagram') {
      toast('Download first, then share on Instagram!', { icon: '📸' });
      return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const getFontFamily = (style?: string) => {
    switch (style) {
      case 'modern': return "'Montserrat', sans-serif";
      case 'clean': return "'Montserrat', sans-serif";
      case 'classic': return "'Playfair Display', serif";
      case 'elegant': return "'Cormorant Garamond', serif";
      case 'bold': return "'Anton', sans-serif";
      case 'playful': return "'Outfit', sans-serif";
      default: return "'Montserrat', sans-serif";
    }
  };

  const getTitlePosition = (pos?: string) => {
    switch (pos) {
      case 'top': return 'top-28 left-0 right-0 items-center';
      case 'bottom': return 'bottom-44 left-0 right-0 items-center';
      case 'left': return 'top-1/2 -translate-y-1/2 left-12 right-auto items-start w-[45%]';
      case 'right': return 'top-1/2 -translate-y-1/2 right-12 left-auto items-end w-[45%]';
      default: return 'top-1/2 -translate-y-1/2 left-0 right-0 items-center';
    }
  };

  const renderContactInfo = () => {
    if (!profile) return null;
    const items = [];
    if (includePhone && profile.phone) items.push({ icon: <Phone size={10} strokeWidth={1.5} />, text: profile.phone });
    if (includeInstagram && profile.instagram_handle) items.push({ icon: <Instagram size={10} strokeWidth={1.5} />, text: profile.instagram_handle });
    if (includeFacebook && profile.facebook_handle) items.push({ icon: <Facebook size={10} strokeWidth={1.5} />, text: profile.facebook_handle });
    if (includeWebsite && profile.website_url) items.push({ icon: <Globe size={10} strokeWidth={1.5} />, text: profile.website_url.replace(/^https?:\/\//, '') });
    if (includeAddress && profile.address) items.push({ icon: <MapPin size={10} strokeWidth={1.5} />, text: profile.address });

    if (items.length === 0) return null;

    return (
      <div className="flex flex-wrap justify-center gap-x-[6cqw] gap-y-[2.5cqw] py-[5cqw] px-[8cqw] w-full">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-[1.5cqw] drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" style={{ color: result?.font_color || '#FFFFFF', fontFamily: getFontFamily(result?.font_style) }}>
            <span className="opacity-90 scale-[1.2]">{item.icon}</span>
            <span className="text-[2.2cqw] font-medium tracking-[0.15em] uppercase whitespace-nowrap opacity-90">{item.text}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {!profile?.business_name && !isLoadingProfile && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-brand-900">Complete your brand profile</h4>
              <p className="text-xs text-brand-700 font-medium">Add your logo and contact details to personalize your posters.</p>
            </div>
          </div>
          <button onClick={() => setShowBrandSettings(true)} className="btn-primary text-xs py-2 px-4 whitespace-nowrap">
            Setup Now
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
        {/* Left Column: Input */}
        <div className="space-y-6 sticky top-8">
            <div className="premium-card p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Campaign Goal</label>
                  {isRecording && (
                    <div className="flex items-center gap-2 text-brand-600 font-bold text-[10px] bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100 animate-pulse">
                      <div className="w-1 h-1 bg-brand-500 rounded-full" />
                      LISTENING
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 50% off on all summer collection, or New gym opening in Mumbai..."
                    className={`w-full h-40 px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all resize-none text-sm font-medium text-slate-700 placeholder:text-slate-400 leading-relaxed ${isRecording ? 'border-brand-300 bg-brand-50/30' : ''}`}
                  />
                  
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {isRecording ? (
                      <button 
                        onClick={stopRecording}
                        className="p-2 bg-brand-600 rounded-xl text-white hover:bg-brand-700 shadow-lg transition-all"
                        title="Stop Recording"
                      >
                        <Square size={16} fill="currentColor" />
                      </button>
                    ) : (
                      <button 
                        onClick={startRecording}
                        className="p-2 bg-white rounded-xl text-slate-400 hover:text-brand-600 shadow-sm border border-slate-200 transition-all"
                        title="Voice Input"
                      >
                        <Mic size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => setShowPromptLibrary(true)}
                      className="p-2 bg-white rounded-xl text-slate-400 hover:text-brand-600 shadow-sm border border-slate-200 transition-all"
                      title="Prompt Library"
                    >
                      <BookOpen size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Shot</label>
                  <div className="relative group">
                    <input type="file" onChange={handleImageUpload} accept="image/*" className="hidden" id="product-upload" />
                    <label htmlFor="product-upload" className="flex flex-col items-center justify-center w-full h-28 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl cursor-pointer group-hover:border-brand-500 group-hover:bg-brand-50/50 transition-all overflow-hidden">
                      {uploadedImage ? (
                        <img src={uploadedImage} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImageIcon className="text-slate-300 mb-2 group-hover:text-brand-500 transition-colors" size={24} />
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-600">Upload Photo</span>
                        </>
                      )}
                    </label>
                    {uploadedImage && (
                      <button onClick={() => setUploadedImage(null)} className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-sm text-slate-400 hover:text-red-500 border border-slate-100">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Include Details</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'phone', icon: Phone, state: includePhone, setter: setIncludePhone },
                      { id: 'insta', icon: Instagram, state: includeInstagram, setter: setIncludeInstagram },
                      { id: 'fb', icon: Facebook, state: includeFacebook, setter: setIncludeFacebook },
                      { id: 'web', icon: Globe, state: includeWebsite, setter: setIncludeWebsite },
                    ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => item.setter(!item.state)} 
                        className={`flex items-center justify-center p-2 rounded-xl border transition-all ${item.state ? 'bg-brand-50 text-brand-600 border-brand-100 shadow-sm' : 'bg-slate-50/50 text-slate-400 border-transparent'}`}
                      >
                        <item.icon size={14} />
                      </button>
                    ))}
                    <button 
                      onClick={() => setIncludeAddress(!includeAddress)} 
                      className={`col-span-2 flex items-center justify-center gap-2 p-2 rounded-xl border transition-all text-[10px] font-bold ${includeAddress ? 'bg-brand-50 text-brand-600 border-brand-100 shadow-sm' : 'bg-slate-50/50 text-slate-400 border-transparent'}`}
                    >
                      <MapPin size={12} /> Address
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={generateContent}
                disabled={isGenerating || isUploading}
                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold tracking-wide"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Designing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Content
                  </>
                )}
              </button>
            </div>

            <div className="premium-card p-4 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-brand-400">
                  <Zap size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Pro Plan</div>
                  <div className="text-xs font-bold">Unlimited Generations</div>
                </div>
              </div>
              <button onClick={() => navigate('/pricing')} className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors">Upgrade</button>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="premium-card p-8 flex flex-col items-center justify-center text-center space-y-8 bg-white border-brand-100 shadow-xl shadow-brand-500/5"
                >
                  <div className="relative">
                    <div className="w-32 h-32 bg-brand-50 rounded-[2.5rem] flex items-center justify-center animate-pulse">
                      <Sparkles size={48} className="text-brand-300" />
                    </div>
                    <div className="absolute -inset-4 border-2 border-dashed border-brand-200 rounded-[3rem] animate-[spin_10s_linear_infinite]" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">Creating your masterpiece...</h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto font-medium leading-relaxed italic">
                      "Design is thinking made visual." — Saul Bass
                    </p>
                  </div>

                  <div className="w-full max-w-xs space-y-4">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 15, ease: "linear" }}
                        className="h-full bg-brand-500"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>Analyzing</span>
                      <span>Designing</span>
                      <span>Polishing</span>
                    </div>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  className="grid 2xl:grid-cols-[1fr_400px] gap-8 items-start"
                >
                  {/* Poster Preview */}
                  <div className="space-y-6 w-full max-w-[600px] mx-auto 2xl:mx-0">
                    <div className="premium-card p-3 bg-slate-100/50 border-slate-200/60 relative group shadow-2xl">
                      <div id="poster-container" ref={posterRef} className="aspect-square relative overflow-hidden rounded-xl bg-white w-full" style={{ containerType: 'inline-size' }}>
                        <img src={result.poster_url} alt="Generated Poster" className="w-full h-full object-cover" crossOrigin="anonymous" />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <div className="absolute inset-0">
                          <style>{`
                            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;700;900&family=Anton&family=Montserrat:wght@300;400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,400&display=swap');
                          `}</style>
                          
                          <div className="absolute inset-0 flex flex-col pointer-events-none">
                            {includeLogo && profile?.logo_url && (
                              <div className="absolute top-[4cqw] left-[4cqw] z-[60] drop-shadow-2xl">
                                <img src={profile.logo_url} alt="Logo" className="h-[8cqw] w-auto object-contain max-w-[20cqw] opacity-80" crossOrigin="anonymous" />
                              </div>
                            )}

                            {result.offer_percentage && (
                              <div className="absolute top-[4cqw] right-[4cqw] z-50">
                                <div className="w-[18cqw] h-[18cqw] rounded-full bg-gradient-to-br from-[#B76E79] via-[#E4B4B4] to-[#B76E79] shadow-2xl flex flex-col items-center justify-center border-[0.4cqw] border-white/30 backdrop-blur-sm" style={{ fontFamily: getFontFamily(result.font_style) }}>
                                  <span className="text-[1.2cqw] font-bold uppercase tracking-widest text-[#4A2C2C] opacity-60 mb-[0.4cqw]">Offer</span>
                                  <span className="text-[2.8cqw] font-black text-[#4A2C2C] leading-none text-center px-[2cqw]">
                                    {result.offer_percentage}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="absolute inset-0 flex flex-col items-center justify-between">
                              <div className={`w-full px-[8cqw] pt-[12cqw] flex flex-col ${result.headline_position === 'right' ? 'items-end text-right' : 'items-center text-center'} z-40`}>
                                <h2 
                                  className="text-[10.5cqw] tracking-tight leading-[1] drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]" 
                                  style={{ 
                                    color: result.font_color, 
                                    fontFamily: getFontFamily(result.font_style), 
                                    fontWeight: result.font_style === 'bold' ? 900 : 700,
                                    textShadow: `0 4px 30px ${result.font_color === '#FFFFFF' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)'}`
                                  }}
                                >
                                  {result.poster_title}
                                </h2>
                                {result.headline_position === 'right' && result.poster_subheading && (
                                  <p 
                                    className="text-[4.2cqw] font-semibold tracking-wide opacity-95 mt-[2.5cqw] drop-shadow-xl" 
                                    style={{ color: result.font_color, fontFamily: getFontFamily(result.font_style) }}
                                  >
                                    {result.poster_subheading}
                                  </p>
                                )}
                              </div>

                              <div className="flex-grow" />

                              <div className="w-full flex flex-col items-center z-40">
                                {result.headline_position !== 'right' && result.poster_subheading && (
                                  <p className="text-[4.5cqw] font-semibold tracking-wide opacity-95 max-w-[88%] text-center mb-[8cqw] drop-shadow-xl" style={{ color: result.font_color, fontFamily: getFontFamily(result.font_style) }}>
                                    {result.poster_subheading}
                                  </p>
                                )}

                                <div className="w-full flex flex-col items-center">
                                  {renderContactInfo()}
                                  
                                  {result.cta && (
                                    <div className="py-[5cqw]">
                                      <button className="px-[10cqw] py-[2cqw] font-bold text-[3cqw] uppercase tracking-[0.25em] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] pointer-events-none" style={{ color: result.font_color, fontFamily: getFontFamily(result.font_style) }}>
                                        {result.cta}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 rounded-2xl pointer-events-none z-50">
                        <button onClick={downloadPoster} className="p-4 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform shadow-xl pointer-events-auto">
                          <Download size={24} />
                        </button>
                        <button onClick={() => shareOnSocial('instagram')} className="p-4 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform shadow-xl pointer-events-auto">
                          <Share2 size={24} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Copy & Social */}
                  <div className="space-y-6">
                    <div className="premium-card p-6 space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instagram Caption</span>
                          <button onClick={() => copyToClipboard(result.long_caption)} className="text-brand-600 hover:text-brand-700 flex items-center gap-1.5 text-xs font-bold">
                            <Copy size={14} /> Copy
                          </button>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-[12]">{result.long_caption}</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Feedback</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleFeedback(result.id, 'like')}
                              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${result.is_liked ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                            >
                              <ThumbsUp size={14} />
                              {result.is_liked ? 'Liked' : 'Like'}
                            </button>
                            <button 
                              onClick={() => handleFeedback(result.id, 'dislike')}
                              className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${result.is_disliked ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
                            >
                              <ThumbsDown size={14} />
                              {result.is_disliked ? 'Disliked' : 'Dislike'}
                            </button>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">Your feedback helps the AI learn your style preferences.</p>
                      </div>

                      {result.hashtags && result.hashtags.length > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hashtags</span>
                            <button onClick={() => copyToClipboard(result.hashtags?.join(' ') || '')} className="text-brand-600 hover:text-brand-700 flex items-center gap-1.5 text-xs font-bold">
                              <Copy size={14} /> Copy All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {result.hashtags.map((tag, i) => (
                              <span key={i} className="text-[10px] bg-white text-slate-600 px-2.5 py-1 rounded-lg font-semibold border border-slate-200 shadow-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Share</div>
                        <div className="grid grid-cols-3 gap-3">
                          <button onClick={() => shareOnSocial('facebook')} className="p-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-brand-50 hover:text-brand-600 transition-all flex justify-center border border-slate-100"><Facebook size={18} /></button>
                          <button onClick={() => shareOnSocial('twitter')} className="p-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-brand-50 hover:text-brand-600 transition-all flex justify-center border border-slate-100"><Twitter size={18} /></button>
                          <button onClick={() => shareOnSocial('instagram')} className="p-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-brand-50 hover:text-brand-600 transition-all flex justify-center border border-slate-100"><Instagram size={18} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 rotate-3">
                    <Sparkles size={48} className="text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Your next viral post starts here</h3>
                  <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                    Describe your promotion or upload a product photo to generate a high-converting marketing content.
                  </p>
                  
                  <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3">
                        <ImageIcon size={16} className="text-brand-500" />
                      </div>
                      <div className="text-xs font-bold text-slate-900 mb-1">AI Visuals</div>
                      <div className="text-[10px] text-slate-500 font-medium">Custom lifestyle shots for your products</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3">
                        <MessageSquare size={16} className="text-purple-500" />
                      </div>
                      <div className="text-xs font-bold text-slate-900 mb-1">Smart Copy</div>
                      <div className="text-[10px] text-slate-500 font-medium">SEO optimized captions and hashtags</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* History Section */}
        {userHistory.length > 0 && (
          <div className="mt-16 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Generations</h3>
                  <p className="text-xs text-slate-500 font-medium">Your last 20 designs</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {userHistory.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    setResult(post);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group-hover:shadow-xl transition-all relative">
                    <img src={post.poster_url} alt={post.poster_title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-2 bg-white rounded-full text-slate-900">
                        <Rocket size={16} />
                      </div>
                    </div>
                    {(post.is_liked || post.is_disliked) && (
                      <div className="absolute top-2 right-2">
                        {post.is_liked ? (
                          <div className="p-1.5 bg-green-500 text-white rounded-lg shadow-lg">
                            <ThumbsUp size={10} />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-red-500 text-white rounded-lg shadow-lg">
                            <ThumbsDown size={10} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{post.poster_title || 'Untitled Design'}</h4>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{new Date(post.created_at || '').toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
        {showPromptLibrary && (
          <PromptLibrary
            isOpen={showPromptLibrary}
            onSelect={(p) => {
              setPrompt(p);
              setShowPromptLibrary(false);
            }}
            onClose={() => setShowPromptLibrary(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
