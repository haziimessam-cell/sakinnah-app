import React from 'react';
import { User, Language, ViewStateName } from '../types';
import { translations } from '../translations';
import { CATEGORIES } from '../constants';
import * as LucideIcons from 'lucide-react';

interface Props {
  user: User;
  language: Language;
  onNavigate: (view: ViewStateName) => void;
  onSelectCategory: (id: ViewStateName) => void;
}

const HomePage: React.FC<Props> = ({ user, language, onNavigate, onSelectCategory }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';

  return (
    <div className="h-full flex flex-col pt-safe pb-safe overflow-hidden animate-m3-fade-in bg-m3-background">
      <header className="px-6 py-6 flex items-center justify-between bg-white border-b border-m3-outline/10 shadow-soft">
        <div className="space-y-0">
            <h1 className="text-2xl font-black text-m3-primary tracking-tighter font-arabic">سكينة</h1>
            <p className="text-[10px] font-bold text-m3-onSurfaceVariant/40 uppercase tracking-[0.5em] font-sans">Sakinnah</p>
        </div>
        <div className="flex gap-3">
            <button onClick={() => onNavigate('PROFILE')} className="p-3 bg-m3-primaryContainer text-m3-primary rounded-m3-lg transition-all active:scale-95">
                <LucideIcons.User size={22} />
            </button>
            <button onClick={() => onNavigate('SETTINGS')} className="p-3 bg-m3-surfaceVariant text-m3-onSurfaceVariant rounded-m3-lg transition-all active:scale-95">
                <LucideIcons.Settings size={22} />
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-10 pt-8 pb-32">
        <section className="space-y-2">
            <h2 className="text-3xl font-extrabold text-m3-onSurface leading-tight tracking-tight">
                {isRTL ? 'مرحباً، ' : 'Welcome, '}<span className="text-m3-primary font-arabic">{user.name}</span>
            </h2>
            <p className="text-m3-onSurfaceVariant font-medium text-base opacity-60">
                {isRTL ? '"ملاذ آمن لروحك وعقلك"' : '"A safe haven for your soul and mind"'}
            </p>
        </section>

        {/* Categories Grid - Strictly Enforcing Labeling Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CATEGORIES.map((cat, idx) => {
                const Icon = (LucideIcons as any)[cat.icon] || LucideIcons.Circle;
                const title = t[cat.id];
                const description = t[`${cat.id}_DESC`];

                // Fail-safe: Strictly skip rendering if title or description is missing
                if (!title || !description) return null;

                const isSpecial = cat.id === 'THERAPY' || cat.id === 'DISTINCT_MINDS';
                
                return (
                    <button 
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                        className={`p-6 rounded-m3-xl border shadow-soft flex items-center text-start gap-6 active:scale-[0.98] transition-all group overflow-hidden relative animate-m3-slide-up
                          ${isSpecial ? 'bg-m3-primary text-white border-m3-primary' : 'bg-white border-m3-outline/10 text-m3-onSurface'}`}
                    >
                        {isSpecial && <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>}
                        <div className={`w-14 h-14 ${isSpecial ? 'bg-white/20' : 'bg-m3-primaryContainer'} ${isSpecial ? 'text-white' : 'text-m3-primary'} rounded-m3-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-500 shrink-0`}>
                            <Icon size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 overflow-hidden z-10">
                            {/* Visible Section Name (Title) */}
                            <h3 className={`text-lg font-bold leading-none mb-2 ${isSpecial ? 'text-white' : 'text-m3-onSurface'}`}>
                                {title}
                            </h3>
                            {/* Short Descriptive Subtitle */}
                            <p className={`text-[13px] font-medium line-clamp-2 leading-relaxed ${isSpecial ? 'text-white/70' : 'text-m3-onSurfaceVariant/60'}`}>
                                {description}
                            </p>
                        </div>
                        <LucideIcons.ChevronLeft size={20} className={`${isRTL ? '' : 'rotate-180'} ${isSpecial ? 'text-white/40' : 'text-m3-outline/40'} group-hover:translate-x-[-4px] transition-all`} />
                    </button>
                );
            })}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 text-center glass border-t border-m3-outline/10 z-30">
          <p className="text-[10px] font-bold text-m3-onSurfaceVariant/30 uppercase tracking-[0.3em] font-sans">{t.clinicalNote}</p>
      </footer>
    </div>
  );
};

export default HomePage;
