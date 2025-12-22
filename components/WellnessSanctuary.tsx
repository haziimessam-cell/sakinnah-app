
import React from 'react';
import { Language, ViewStateName } from '../types';
import { translations } from '../translations';
import { 
  ArrowLeft, ArrowRight, MessageSquare, Moon, Ghost, Sparkles, Wind, ArrowUpRight, Cloud
} from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
  onSelectOption: (view: ViewStateName) => void;
}

const WellnessSanctuary: React.FC<Props> = ({ onBack, language, onSelectOption }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';

  const options = [
    { id: 'FADFADA', title: t.ventingOption, desc: isRTL ? 'تحدث بكل حرية' : 'Speak freely', icon: <MessageSquare size={30} />, color: 'from-orange-500 to-rose-600', shadow: 'shadow-orange-500/20' },
    { id: 'SLEEP_SANCTUARY', title: t.sleepOption, desc: isRTL ? 'حكايات وموسيقى' : 'Tales & Music', icon: <Moon size={30} />, color: 'from-sakinnah-azure to-indigo-700', shadow: 'shadow-blue-500/20' },
    { id: 'SOCIAL_SANDBOX', title: t.sandboxOption, desc: isRTL ? 'فن التعامل الذكي' : 'Social Intelligence', icon: <Ghost size={30} />, color: 'from-emerald-500 to-teal-700', shadow: 'shadow-emerald-500/20' },
    { id: 'DREAM', title: t.dreamsOption, desc: isRTL ? 'بوابة اللاوعي' : 'The Unconscious', icon: <Sparkles size={30} />, color: 'from-purple-600 to-fuchsia-800', shadow: 'shadow-purple-500/20' }
  ];

  return (
    <div className="h-full bg-[#020408] flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden relative font-sans">
      {/* Visual Ambiance */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b,transparent_70%)] opacity-60"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      
      <header className="px-8 py-8 flex items-center justify-between z-20">
         <button onClick={onBack} className="p-4 bg-white/5 border border-white/10 rounded-3xl active:scale-90 transition-all text-white/60 hover:text-white">
            {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <div className="text-center">
            <h1 className="text-lg font-black uppercase tracking-[0.5em] text-white italic">{t.wellnessSanctuary}</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
                <Cloud size={10} className="text-white/20 animate-pulse" />
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{isRTL ? 'ملاذ الراحة النفسية' : 'THE INNER JOURNEY'}</span>
            </div>
         </div>
         <div className="p-4 bg-sakinnah-azure/10 rounded-3xl border border-sakinnah-azure/20">
            <Wind size={24} className="text-sakinnah-azure animate-pulse" />
         </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-8 z-10 space-y-6 pb-20">
          {options.map((opt, idx) => (
              <button 
                key={opt.id}
                onClick={() => onSelectOption(opt.id as ViewStateName)}
                style={{ animationDelay: `${idx * 150}ms` }}
                className="w-full bg-white/5 border border-white/10 rounded-[3rem] p-8 flex items-center gap-8 group hover:bg-white/10 hover:border-white/20 transition-all text-start active:scale-95 animate-reveal"
              >
                  <div className={`w-22 h-22 bg-gradient-to-br ${opt.color} rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl ${opt.shadow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      {opt.icon}
                  </div>
                  <div className="flex-1">
                      <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2">{opt.title}</h3>
                      <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">{opt.desc}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/10 group-hover:text-sakinnah-azure group-hover:bg-sakinnah-azure/10 transition-all">
                      <ArrowUpRight size={24} />
                  </div>
              </button>
          ))}
      </main>

      <div className="px-10 py-10 text-center opacity-10 pointer-events-none z-0">
          <p className="text-[10px] font-black tracking-[0.8em] uppercase text-white">SAKINNAH WELLNESS CORE v.2.5</p>
      </div>
    </div>
  );
};

export default WellnessSanctuary;
