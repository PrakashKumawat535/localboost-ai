import React from 'react';
import { 
  History as HistoryIcon, 
  Download, 
  Copy, 
  Trash2, 
  ExternalLink,
  Search,
  Calendar,
  Filter,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { GeneratedPost } from '../types';
import toast from 'react-hot-toast';

export default function History() {
  const { user } = useAuth();
  const [posts, setPosts] = React.useState<GeneratedPost[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      if (!user) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from('generated_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.message?.includes('Could not find the table')) {
          toast.error('Database setup required. Please run the SQL in your Supabase dashboard.', { duration: 6000 });
        } else {
          throw error;
        }
      }
      setPosts(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPost = async (url: string) => {
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `localboost-post-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPosts(posts.filter(p => p.id !== id));
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(p => 
    p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans selection:bg-brand-100 selection:text-brand-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            <HistoryIcon size={12} />
            Archive
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Generation History</h1>
          <p className="text-slate-500 font-medium">Access and manage all your past creations in one place.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by prompt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/5] bg-white rounded-[2.5rem] animate-pulse border border-slate-100 shadow-sm" />
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.div
                layout
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="premium-card overflow-hidden group flex flex-col h-full"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  <img 
                    src={post.poster_url} 
                    alt={post.prompt} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <button 
                      onClick={() => downloadPost(post.poster_url)}
                      className="p-4 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform shadow-xl"
                      title="Download"
                    >
                      <Download size={20} />
                    </button>
                    <button 
                      onClick={() => deletePost(post.id!)}
                      className="p-4 bg-white rounded-full text-red-500 hover:scale-110 transition-transform shadow-xl"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button className="p-2 bg-white/80 backdrop-blur-md rounded-xl text-slate-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4 flex-grow flex flex-col">
                  <p className="text-sm text-slate-600 line-clamp-2 font-medium leading-relaxed flex-grow">
                    {post.prompt}
                  </p>
                  
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {new Date(post.created_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <button className="text-brand-600 hover:text-brand-700 font-bold text-xs flex items-center gap-1.5 transition-colors">
                      Details <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm"
        >
          <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
            <HistoryIcon size={48} className="text-slate-200" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">No history found</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
            You haven't generated any content yet. Start creating to see your history here.
          </p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="mt-10 btn-primary px-8 py-4 rounded-2xl text-sm font-bold tracking-wide"
          >
            Create New Content
          </button>
        </motion.div>
      )}
    </div>
  );
}
