
import React from 'react';
import { Category, Language } from '../types';
import { translations } from '../translations';
import * as Icons from 'lucide-react';
import { Info, Sparkles } from 'lucide-react';

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
      if (category.color.includes('orange')) return 'from-orange-50 to-orange-100 text-orange-600 border-orange-200';
      if (category.color.includes('teal')) return 'from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-200';
      if (category.color.includes('yellow')) return 'from-yellow-50 to-yellow-100 text-yellow-600 border-yellow-200';
      if (category.color.includes('indigo')) return 'from-indigo-50 to-indigo-100 text-indigo-600 border-indigo-200';
      if (category.color.includes('lime')) return 'from-lime-50 to-lime-100 text-lime-600 border-lime-200';
      if (category.color.includes('rose')) return 'from-rose-50 to-rose-100 text-rose-600 border-rose-200';
      if (category.color.includes('slate')) return 'from-slate-50 to-slate-100 text-slate-600 border-slate-200';
      if (category.color.includes('cyan')) return 'from-cyan-50 to-cyan-100 text-cyan-600 border-cyan-200';
      if (category.color.includes('purple')) return 'from-purple-50 to-purple-100 text-purple-600 border-purple-200';
      return 'from-gray-50 to-gray-100 text-gray-600 border-gray-200';
  };

  if (isSmall) {
    return (
        <div
          onClick={() => onClick(category)}
          style={{ animationDelay: `${index * 80}ms` }}
          className="relative flex flex-col items-center justify-center aspect-square glass rounded-[2rem] border border-white shadow-sm hover:bg-white transition-all group active:scale-95 animate-reveal cursor-pointer p-4"
        >
          <div className={`w-14 h-14 bg-gradient-to-br ${getGradient()} rounded-2xl flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform duration-500 border`}>
            <IconComponent size={24} />
          </div>
          <span className="text-[8px] font-black text-slate-400 text-center uppercase tracking-[0.2em] line-clamp-1 px-1">{title}</span>
        </div>
    );
  }

  return (
    <div
      onClick={() => onClick(category)}
      style={{ animationDelay: `${index * 150}ms` }}
      className="relative flex flex-col items-center justify-center h-48 glass-card rounded-[2.5rem] border border-white hover:border-emerald-100 transition-all group active:scale-[0.97] animate-reveal overflow-hidden cursor-pointer p-6"
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${getGradient()} rounded-[1.5rem] flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 group-hover:rotate-2 transition-all duration-500 border relative`}>
        <IconComponent size={28} />
      </div>
      
      <div className="flex flex-col items-center gap-1">
          <h3 className="text-slate-700 font-bold text-sm text-center tracking-tight font-sans">{title}</h3>
          <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em] font-arabic">{category.id}</p>
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onInfo(category); }}
        className="absolute bottom-5 right-5 p-2 bg-slate-50 rounded-full text-slate-200 hover:text-emerald-500 transition-all border border-slate-100"
      >
          <Info size={12} />
      </button>

      {/* Gloss effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
    </div>
  );
};

export default CategoryCard;
