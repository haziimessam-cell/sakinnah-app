
import React from 'react';
import { Category, Language } from '../types';
import { translations } from '../translations';
import * as Icons from 'lucide-react';
import { Info } from 'lucide-react';

interface Props {
  category: Category;
  onClick: (category: Category) => void;
  onInfo: (category: Category) => void;
  index: number;
  language: Language;
}

const CategoryCard: React.FC<Props> = ({ category, onClick, onInfo, index, language }) => {
  const t = translations[language] as any;
  const IconComponent = (Icons as any)[category.icon] || Icons.HelpCircle;
  
  const titleKey = `cat_${category.id}_title`;
  const title = t[titleKey] || category.id;

  // Robust gradient mapping - returns specific classes for background and shadow
  const getStyle = () => {
      if (category.color.includes('rose')) return { bg: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-300/50', glow: 'bg-rose-500' };
      if (category.color.includes('teal')) return { bg: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-300/50', glow: 'bg-teal-500' };
      if (category.color.includes('blue')) return { bg: 'from-sky-500 to-blue-600', shadow: 'shadow-blue-300/50', glow: 'bg-blue-500' };
      if (category.color.includes('orange')) return { bg: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-300/50', glow: 'bg-orange-500' };
      if (category.color.includes('purple')) return { bg: 'from-violet-500 to-purple-600', shadow: 'shadow-purple-300/50', glow: 'bg-purple-500' };
      if (category.color.includes('indigo')) return { bg: 'from-indigo-500 to-blue-700', shadow: 'shadow-indigo-300/50', glow: 'bg-indigo-500' };
      if (category.color.includes('slate')) return { bg: 'from-slate-500 to-gray-700', shadow: 'shadow-slate-300/50', glow: 'bg-slate-500' };
      return { bg: 'from-gray-700 to-gray-900', shadow: 'shadow-gray-300/50', glow: 'bg-gray-500' };
  };

  const style = getStyle();

  return (
    <div
      onClick={() => {
        if (navigator.vibrate) navigator.vibrate(5);
        onClick(category);
      }}
      style={{ animationDelay: `${index * 60}ms` }}
      className="relative flex flex-col items-center justify-center h-40 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-500 group active:scale-[0.96] animate-slideUp opacity-0 overflow-hidden border border-white/40 cursor-pointer"
    >
      {/* INFO BUTTON */}
      <button 
        onClick={(e) => {
            e.stopPropagation();
            onInfo(category);
        }}
        className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/40 hover:bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-primary-600 backdrop-blur-md border border-white/30 transition-all shadow-sm active:scale-90"
        title="Info"
      >
          <Info size={16} />
      </button>

      {/* Internal Glass Reflection */}
      <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-white/50 to-transparent pointer-events-none"></div>
      
      {/* Colorful Glow Blob for Art Effect */}
      <div className={`absolute -bottom-8 -right-8 w-28 h-28 ${style.glow} rounded-full opacity-30 blur-2xl group-hover:opacity-50 transition-all duration-700 group-hover:scale-125`}></div>
      
      {/* Icon Container - Floating Jewel */}
      <div className={`w-16 h-16 bg-gradient-to-br ${style.bg} rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl ${style.shadow} transform group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 relative z-10 border border-white/20`}>
        <IconComponent size={30} strokeWidth={2.5} className="drop-shadow-md" />
        {/* Shine on Icon */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      <h3 className="text-gray-800 font-bold text-sm text-center relative z-10 px-3 leading-tight group-hover:text-black transition-colors">{title}</h3>
      
      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none skew-x-12"></div>
    </div>
  );
};

export default CategoryCard;
