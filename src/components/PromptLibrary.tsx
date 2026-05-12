import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, BookOpen, ChevronRight, Sparkles, Tag } from 'lucide-react';
import { PROMPT_TEMPLATES, PROMPT_CATEGORIES } from '../constants/promptTemplates';
import { PromptTemplate } from '../types';

interface PromptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: string) => void;
}

export default function PromptLibrary({ isOpen, onClose, onSelect }: PromptLibraryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const filteredTemplates = PROMPT_TEMPLATES.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.template.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-100"
          >
            {/* Header */}
            <div className="p-6 lg:p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                  <BookOpen className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Prompt Library</h2>
                  <p className="text-slate-500 text-sm">Select a template to kickstart your content</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search and Filters */}
            <div className="p-6 lg:p-8 bg-slate-50/50 border-b border-slate-100 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-0 transition-all text-slate-900"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    !selectedCategory 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  All Categories
                </button>
                {PROMPT_CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => (
                    <motion.button
                      key={template.id}
                      whileHover={{ y: -4 }}
                      onClick={() => {
                        onSelect(template.template);
                        onClose();
                      }}
                      className="group text-left p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex flex-col h-full"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                          <Tag size={12} />
                          {template.category}
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={20} />
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-slate-500 text-sm mb-4 flex-1">
                        {template.description}
                      </p>
                      
                      <div className="pt-4 border-t border-slate-50 mt-auto">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                          <Sparkles size={16} />
                          Use Template
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No templates found</h3>
                  <p className="text-slate-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
