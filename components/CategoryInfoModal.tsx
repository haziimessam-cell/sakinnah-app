
import React from 'react';
import { X, Sparkles, BookOpen, Activity } from 'lucide-react';
import { Category, Language } from '../types';
import { translations } from '../translations';

interface Props {
  category: Category;
  onClose: () => void;
  language: Language;
}

const CategoryInfoModal: React.FC<Props> = ({ category, onClose, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const title = t[`cat_${category.id}_title`] || category.id;
  const desc = t[`cat_${category.id}_desc`] || '';
  
  // Use specific science description if available, otherwise fallback to generic based on language
  const science = t[`cat_${category.id}_science`] || (language === 'ar' 
    ? 'يعتمد هذا القسم على بروتوكولات العلاج المعرفي السلوكي (CBT) وتقنيات اليقظة الذهنية المعتمدة عالمياً.' 
    : 'This section utilizes Cognitive Behavioral Therapy (CBT) protocols and globally recognized mindfulness techniques.');

  // Robust gradient generation using explicit classes to ensure Tailwind compiles them
  const getGradient = () => {
    if (category.color.includes('rose')) return 'from-rose-500 to-pink-600';
    if (category.color.includes('red')) return 'from-red-500 to-rose-600';
    if (category.color.includes('teal')) return 'from-teal-500 to-emerald-600';
    if (category.color.includes('blue')) return 'from-sky-500 to-blue-600';
    if (category.color.includes('orange')) return 'from-orange-500 to-amber-600';
    if (category.color.includes('purple')) return 'from-violet-500 to-purple-600';
    if (category.color.includes('indigo')) return 'from-indigo-500 to-blue-700'; // For Sleep
    if (category.color.includes('slate')) return 'from-slate-500 to-gray-700';
    return 'from-gray-500 to-gray-700';
  };

  const gradientClass = getGradient();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden animate-scaleIn">
        
        {/* Artistic Header Background */}
        <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br ${gradientClass} opacity-20 pointer-events-none`}></div>
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/30 rounded-full blur-3xl"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white/80 rounded-full transition-all text-gray-600 z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-10 relative z-10 flex flex-col items-center text-center">
            <div className={`w-20 h-20 ${category.color} rounded-3xl flex items-center justify-center text-white shadow-xl shadow-gray-200 mb-6 transform rotate-3 border-4 border-white/50`}>
                 <BookOpen size={32} />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
            
            <div className="flex items-center gap-2 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-6 border border-primary-100">
                <Activity size={12} />
                <span>{language === 'ar' ? 'الهدف والمنهجية' : 'Purpose & Methodology'}</span>
            </div>

            <p className="text-gray-600 leading-relaxed text-sm mb-8 font-medium">
                {desc}
            </p>

            <div className="w-full bg-white/60 rounded-2xl p-4 border border-white/60 text-start flex gap-3 shadow-sm">
                <div className="mt-1">
                    <Sparkles size={18} className="text-teal-600" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase mb-1">
                        {language === 'ar' ? 'الأساس العلمي' : 'Scientific Basis'}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        {science}
                    </p>
                </div>
            </div>
            
            <button 
              onClick={onClose}
              className="mt-8 w-full py-3.5 bg-gray-900 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
                {language === 'ar' ? 'فهمت' : 'Got it'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryInfoModal;
