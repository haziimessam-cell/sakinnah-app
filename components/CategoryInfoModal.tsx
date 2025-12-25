import React from 'react';
import { X, Sparkles, BookOpen, Activity, Bookmark, ShieldCheck, ListChecks } from 'lucide-react';
import { Category, Language } from '../types';
import { translations } from '../translations';

interface Props {
  category: Category | { id: string, icon: string, color: string };
  onClose: () => void;
  language: Language;
}

const CategoryInfoModal: React.FC<Props> = ({ category, onClose, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const id = category.id;
  const title = t[id] || id;
  const description = t[`cat_${id}_desc`] || t[`${id}_DESC`] || '';
  const references = t[`cat_${id}_refs`] || '';
  const methods = t[`cat_${id}_methods`] || '';

  const getGradient = () => {
    if (category.color.includes('rose')) return 'from-rose-500 to-pink-600';
    if (category.color.includes('teal')) return 'from-teal-500 to-emerald-600';
    if (category.color.includes('indigo')) return 'from-indigo-500 to-blue-700';
    if (category.color.includes('emerald')) return 'from-emerald-500 to-teal-600';
    if (category.color.includes('orange')) return 'from-orange-500 to-amber-600';
    return 'from-gray-500 to-gray-700';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col">
        
        {/* Artistic Header Background */}
        <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br ${getGradient()} opacity-10 pointer-events-none`}></div>

        <header className="px-8 pt-8 pb-4 flex items-center justify-between z-10 sticky top-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${category.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 leading-none mb-1">{title}</h2>
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{t.activeProtocol}</span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all text-gray-600">
              <X size={20} />
            </button>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-4 space-y-8">
            {/* Overview */}
            <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                    <Activity size={14} className="text-primary-500" />
                    {t.clinicalOverview}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {description}
                </p>
            </section>

            {/* Methods */}
            {methods && (
                <section className="space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <ListChecks size={14} className="text-emerald-500" />
                        {t.methods}
                    </h3>
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                        <pre className="text-xs text-emerald-800 leading-relaxed font-medium whitespace-pre-wrap font-sans">
                            {methods}
                        </pre>
                    </div>
                </section>
            )}

            {/* References */}
            {references && (
                <section className="space-y-3">
                    <h3 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <Bookmark size={14} className="text-indigo-500" />
                        {t.references}
                    </h3>
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                        <pre className="text-xs text-indigo-800 leading-relaxed font-medium whitespace-pre-wrap font-sans">
                            {references}
                        </pre>
                    </div>
                </section>
            )}

            {/* Scientific Footer Badge */}
            <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 flex gap-4 items-start">
                <Sparkles size={20} className="text-primary-600 mt-0.5" />
                <p className="text-[11px] text-primary-800 leading-relaxed font-bold italic">
                    {language === 'ar' 
                      ? 'يعتمد هذا البروتوكول على أحدث الأبحاث السريرية المذكورة أعلاه لضمان تقديم الرعاية النفسية الأكثر فعالية.' 
                      : 'This protocol is built upon the latest clinical research listed above to ensure the most effective psychological care.'}
                </p>
            </div>
        </div>

        <footer className="p-8 pt-4 border-t border-gray-100 bg-gray-50/50">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.01] active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
                {language === 'ar' ? 'فهمت' : 'Got it'}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default CategoryInfoModal;