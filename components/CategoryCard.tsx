
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
  isSmall?: boolean;
}

const CategoryCard: React.FC<Props> = ({ category, onClick, onInfo, index, language, isSmall = false }) => {
  const t = translations[language] as any;
  const IconComponent = (Icons as any)[category.icon] || Icons.CircleHelp;
  
  const titleKey = `cat_${category.id}_title`;
  const title = t[titleKey] || category.id;

  const getGradient = () => {
      if (category.color.includes('orange')) return 'from-orange-400 to-orange-600';
      if (category.color.includes('teal')) return 'from-teal-400 to-teal-600';
      if (category.color.includes('yellow')) return 'from-yellow-400 to-amber-600';
      if (category.color.includes('indigo')) return 'from-indigo-400 to-indigo-600';
      if (category.color.includes('lime')) return 'from-lime-400 to-green-600';
      if (category.color.includes('rose')) return 'from-rose-400 to-pink-600';
      if (category.color.includes('slate')) return 'from-slate-400 to-slate-600';
      if (category.color.includes('cyan')) return 'from-cyan-400 to-blue-600';
      if (category.color.includes('purple')) return 'from-purple-400 to-purple-700';
      if (category.color.includes('violet')) return 'from-violet-400 to-violet-700';
      return 'from-gray-400 to-gray-600';
  };

  if (isSmall) {
    return (
        <div
          onClick={() => onClick(category)}
          style={{ animationDelay: `${index * 50}ms` }}
          className="relative flex flex-col items-center justify-center aspect-square bg-white/60 backdrop-blur-md rounded-3xl border border-white shadow-sm hover:shadow-md hover:bg-white transition-all group active:scale-90 animate-scaleIn cursor-pointer p-2"
        >
          <div className={`w-10 h-10 bg-gradient-to-br ${getGradient()} rounded-xl flex items-center justify-center text-white mb-2 shadow-sm group-hover:scale-110 transition-transform`}>
            <IconComponent size={20} />
          </div>
          <span className="text-[9px] font-black text-gray-500 text-center uppercase tracking-tight line-clamp-1">{title}</span>
        </div>
    );
  }

  return (
    <div
      onClick={() => onClick(category)}
      style={{ animationDelay: `${index * 50}ms` }}
      className="relative flex flex-col items-center justify-center h-44 bg-white rounded-[2.5rem] shadow-md border border-white hover:shadow-xl transition-all group active:scale-95 animate-slideUp overflow-hidden cursor-pointer"
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${getGradient()} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        <IconComponent size={32} />
      </div>
      
      <div className="flex items-center gap-2 px-2">
          <h3 className="text-gray-800 font-bold text-sm text-center">{title}</h3>
          <button 
            onClick={(e) => { e.stopPropagation(); onInfo(category); }}
            className="p-1 bg-gray-50 rounded-full text-gray-400 hover:text-primary-600 transition-colors"
          >
              <Info size={14} />
          </button>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
    </div>
  );
};

export default CategoryCard;
