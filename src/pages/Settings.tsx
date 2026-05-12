import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Globe, 
  Zap, 
  Shield, 
  Share2, 
  Calendar, 
  TrendingUp, 
  Layers, 
  Palette, 
  Layout as LayoutIcon,
  Bot,
  Mic,
  BarChart3,
  Eye,
  Search,
  TestTube2,
  Rocket,
  Users,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeType?: 'soon' | 'beta' | 'pro';
}

const FeatureCard = ({ icon, title, description, badge, badgeType = 'soon' }: FeatureCardProps) => (
  <motion.div 
    whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all cursor-pointer group"
    onClick={() => toast(`More info about ${title} coming soon!`)}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
        {icon}
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
          badgeType === 'soon' ? 'bg-slate-100 text-slate-500' : 
          badgeType === 'beta' ? 'bg-amber-100 text-amber-600' : 
          'bg-indigo-100 text-indigo-600'
        }`}>
          {badge}
        </span>
      )}
    </div>
    <h3 className="text-sm font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
  </motion.div>
);

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const SettingItem = ({ icon, title, description, action }: SettingItemProps) => (
  <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 font-medium">{description}</p>
      </div>
    </div>
    {action || <ChevronRight size={18} className="text-slate-300" />}
  </div>
);

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [aiStyle, setAiStyle] = React.useState('Premium');

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings & Features</h1>
        <p className="text-slate-500 font-medium">Customize your experience and explore upcoming tools</p>
      </div>

      {/* Current Settings */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-indigo-600 rounded-full" />
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">General Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-2">
              <SettingItem 
                icon={<User size={20} />} 
                title="Account Settings" 
                description="Manage your profile and personal information" 
              />
              <SettingItem 
                icon={isDarkMode ? <Moon size={20} /> : <Sun size={20} />} 
                title="Theme Appearance" 
                description="Switch between light and dark mode" 
                action={
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-12 h-6 bg-slate-200 rounded-full relative transition-colors"
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                  </button>
                }
              />
              <SettingItem 
                icon={<Bell size={20} />} 
                title="Notifications" 
                description="Configure how you receive updates" 
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-2">
              <SettingItem 
                icon={<Globe size={20} />} 
                title="Language" 
                description="Select your preferred interface language" 
                action={<span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">English</span>}
              />
              <SettingItem 
                icon={<Zap size={20} />} 
                title="AI Output Style" 
                description="Choose the tone of your generated content" 
                action={
                  <select 
                    value={aiStyle} 
                    onChange={(e) => setAiStyle(e.target.value)}
                    className="text-xs font-bold text-slate-600 bg-slate-50 border-none rounded-lg focus:ring-0 cursor-pointer"
                  >
                    <option>Minimal</option>
                    <option>Creative</option>
                    <option>Premium</option>
                  </select>
                }
              />
              <SettingItem 
                icon={<Shield size={20} />} 
                title="Privacy & Security" 
                description="Manage your data and security preferences" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Coming Soon */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-indigo-600 rounded-full" />
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Product Roadmap</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Share2 />} 
            title="Direct Social Posting" 
            description="Auto-post your designs directly to Instagram, Facebook, LinkedIn, and Twitter."
            badge="Coming Soon"
          />
          <FeatureCard 
            icon={<Calendar />} 
            title="Post Scheduling" 
            description="Plan your content ahead of time with our smart calendar and scheduling system."
            badge="Beta"
            badgeType="beta"
          />
          <FeatureCard 
            icon={<TrendingUp />} 
            title="AI Auto-Optimization" 
            description="Let AI analyze performance and automatically improve your post designs."
            badge="Coming Soon"
          />
          <FeatureCard 
            icon={<Layers />} 
            title="Multi-Platform Generator" 
            description="One click to generate matching content for Reels, Ads, Stories, and Posts."
            badge="Pro"
            badgeType="pro"
          />
          <FeatureCard 
            icon={<Palette />} 
            title="Brand Kit System" 
            description="Save your logos, brand colors, and fonts for perfectly consistent designs."
            badge="Coming Soon"
          />
          <FeatureCard 
            icon={<LayoutIcon />} 
            title="Smart Template Library" 
            description="Access thousands of AI-generated templates specifically for your business niche."
            badge="Coming Soon"
          />
        </div>
      </section>

      {/* Future Vision */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-indigo-600 rounded-full" />
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">2026–2040 Vision</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Sparkles className="text-indigo-500" />} 
            title="Trend Prediction Engine" 
            description="Predict viral trends before they happen using global data analysis."
            badge="Vision"
            badgeType="pro"
          />
          <FeatureCard 
            icon={<Bot className="text-indigo-500" />} 
            title="Auto Posting Bot" 
            description="Fully automated posting and optimization loop for hands-free growth."
            badge="Vision"
          />
          <FeatureCard 
            icon={<Mic className="text-indigo-500" />} 
            title="Voice-to-Content AI" 
            description="Just speak your idea, and the AI generates a complete marketing campaign."
            badge="Vision"
          />
          <FeatureCard 
            icon={<BarChart3 className="text-indigo-500" />} 
            title="Real-Time Analytics" 
            description="Track engagement and ROI instantly with deep-dive performance metrics."
            badge="Vision"
          />
          <FeatureCard 
            icon={<User className="text-indigo-500" />} 
            title="Personal Branding Assistant" 
            description="AI that builds and maintains your unique brand identity automatically."
            badge="Vision"
          />
          <FeatureCard 
            icon={<Eye className="text-indigo-500" />} 
            title="AR/VR Content Preview" 
            description="Preview your posts in immersive 3D environments before publishing."
            badge="Vision"
          />
          <FeatureCard 
            icon={<Search className="text-indigo-500" />} 
            title="AI Competitor Analysis" 
            description="Analyze competitor strategies and get suggestions to outperform them."
            badge="Vision"
          />
          <FeatureCard 
            icon={<TestTube2 className="text-indigo-500" />} 
            title="Smart A/B Testing" 
            description="AI automatically tests multiple designs and selects the highest performer."
            badge="Vision"
          />
          <FeatureCard 
            icon={<Rocket className="text-indigo-500" />} 
            title="One-Click Campaigns" 
            description="Generate a full month's marketing campaign in a single click."
            badge="Vision"
          />
          <FeatureCard 
            icon={<Users className="text-indigo-500" />} 
            title="AI Influencer Matching" 
            description="Find the perfect influencers for your brand using AI matching logic."
            badge="Vision"
          />
        </div>
      </section>

      {/* Footer CTA */}
      <div className="bg-indigo-600 rounded-3xl p-10 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl font-bold">Want to shape the future?</h2>
          <p className="text-indigo-100 max-w-md mx-auto font-medium">
            Join our early access program to test these features before they go public.
          </p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
            Join Beta Program
          </button>
        </div>
      </div>
    </div>
  );
}
