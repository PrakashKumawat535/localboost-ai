import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Zap, Image as ImageIcon, MessageSquare, ChevronRight, Star, Play, X, ArrowRight, Sparkles, Shield, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-100 selection:text-brand-700">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">LocalBoost</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Success Stories</a>
            <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-slate-600 text-xs font-semibold mb-8">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
              Now powered by Gemini 1.5 Pro
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1]">
              Marketing that works <br />
              <span className="text-brand-600">while you work.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              The all-in-one AI platform for local businesses. Generate stunning posters, 
              engaging captions, and trending hashtags in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto btn-primary px-10 py-4 text-lg rounded-xl flex items-center justify-center gap-2 group">
                Start for free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => setShowDemo(true)}
                className="w-full sm:w-auto btn-secondary px-10 py-4 text-lg rounded-xl flex items-center justify-center gap-2"
              >
                <Play size={18} className="fill-slate-900" />
                Watch Demo
              </button>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-24 relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-40 bottom-0 top-auto" />
              <div className="premium-card overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border-slate-200/60">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                  alt="Dashboard Preview" 
                  className="w-full h-auto opacity-90"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-12">Trusted by 5,000+ local businesses</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-40 grayscale contrast-125">
            <span className="text-xl font-black tracking-tighter">SALONPRO</span>
            <span className="text-xl font-black tracking-tighter italic">GYMMASTER</span>
            <span className="text-xl font-black tracking-tighter">SHOPBOOST</span>
            <span className="text-xl font-black tracking-tighter underline decoration-4">LOCALFLOW</span>
            <span className="text-xl font-black tracking-tighter">BOOSTIFY</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 lg:py-48 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-24">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">Everything you need to <br />grow your local brand.</h2>
            <p className="text-lg text-slate-500 font-medium">Stop wasting hours on design. Let AI handle the heavy lifting while you focus on your customers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "AI Poster Engine",
                desc: "Professional marketing posters tailored to your brand colors and product category.",
                icon: ImageIcon,
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                title: "Smart Captions",
                desc: "High-converting copy and trending hashtags optimized for Instagram and Facebook.",
                icon: MessageSquare,
                color: "text-purple-600",
                bg: "bg-purple-50"
              },
              {
                title: "Brand Intelligence",
                desc: "AI that learns your brand voice and target audience for perfectly aligned content.",
                icon: Zap,
                color: "text-amber-600",
                bg: "bg-amber-50"
              }
            ].map((feature, i) => (
              <div key={i} className="group">
                <div className={`${feature.bg} ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-extrabold text-slate-900 mb-2">94%</div>
              <p className="text-slate-500 font-medium">Faster content creation</p>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-slate-900 mb-2">3.5x</div>
              <p className="text-slate-500 font-medium">Higher engagement rate</p>
            </div>
            <div>
              <div className="text-5xl font-extrabold text-slate-900 mb-2">500k+</div>
              <p className="text-slate-500 font-medium">Posters generated</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 lg:py-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-400 via-transparent to-transparent" />
            <h2 className="text-4xl lg:text-6xl font-bold mb-8 tracking-tight">Ready to boost your <br />local business?</h2>
            <p className="text-slate-400 text-xl mb-12 max-w-xl mx-auto font-medium">
              Join thousands of business owners who are already winning with LocalBoost.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-xl">
                Get Started for Free
              </Link>
              <Link to="/pricing" className="w-full sm:w-auto bg-slate-800 text-white border border-slate-700 px-10 py-5 rounded-xl font-bold text-lg hover:bg-slate-700 transition-all">
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={16} />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">LocalBoost</span>
            </div>
            <div className="flex gap-12">
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Privacy</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Terms</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Contact</a>
            </div>
            <div className="text-sm font-medium text-slate-400">
              © 2026 LocalBoost AI.
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemo(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-200"
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="aspect-video w-full bg-slate-900">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                  title="LocalBoost AI Demo" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
