import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  CreditCard, 
  Settings, 
  LogOut, 
  Sparkles,
  Menu,
  X,
  UserCircle,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  session?: any;
}

export default function Layout({ children }: LayoutProps) {
  const { session, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/onboarding', icon: UserCircle },
    { name: 'Pricing', path: '/pricing', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isLandingPage || isAuthPage || !session) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans selection:bg-brand-100 selection:text-brand-700">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-600 active:scale-95 transition-all"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0 shadow-2xl shadow-slate-200" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center gap-3">
            <div 
              className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              LocalBoost
            </span>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 mt-4">
            <div className="px-4 mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</span>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300",
                    isActive 
                      ? "bg-brand-50 text-brand-700 shadow-sm shadow-brand-100/50" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={cn("transition-colors", isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600")} />
                    <span className="text-sm font-bold tracking-wide">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-brand-400" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 mt-auto">
            <div className="premium-card p-4 bg-slate-900 text-white mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Sparkles size={16} className="text-brand-400" />
                </div>
                <span className="text-xs font-bold tracking-wide">Pro Plan</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mb-3 leading-relaxed">Unlock unlimited generations and premium 4K posters.</p>
              <button 
                onClick={() => navigate('/pricing')}
                className="w-full py-2 bg-white text-slate-900 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-colors"
              >
                Upgrade Now
              </button>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-300 group"
            >
              <LogOut size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
              <span className="text-sm font-bold tracking-wide">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto relative">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-12">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
