
import React from 'react';
import { Language, ViewStateName } from '../types';
import { translations } from '../translations';
import { 
  ArrowLeft, ArrowRight, MessageSquare, Moon, Ghost, Sparkles, ChevronRight
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
    { id: 'FADFADA', title: t.ventingOption, desc: isRTL ? 'تحليل الأفكار والمشاعر' : 'Thought & feeling analysis', icon: <MessageSquare size={28} />, color: 'bg-m3-primary' },
    { id: 'SOCIAL_SANDBOX', title: t.sandboxOption, desc: isRTL ? 'محاكاة المواقف الصعبة' : 'Hard situation simulation', icon: <Ghost size={28} />, color: 'bg-m3-secondary' },
    { id: 'DREAM', title: t.dreamsOption, desc: isRTL ? 'تفكيك رموز اللاوعي' : 'Deconstructing symbols', icon: <Sparkles size={28} />, color: 'bg-m3-primary' }
  ];

  return (
    <div className="h-full bg-m3-background flex flex-col pt-safe pb-safe animate-m3-fade-in overflow-hidden">
      <header className="px-6 py-6 flex items-center justify-between border-b border-m3-outline/5 bg-white">
         <button onClick={onBack} className="w-10 h-10 bg-m3-surfaceVariant rounded-full flex items-center justify-center text-m3-primary active:scale-90 transition-all">
            {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
         </button>
         <h1 className="text-xl font-bold text-m3-onSurface">{t.wellnessSanctuary}</h1>
         <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pt-6">
          <p className="text-m3-onSurfaceVariant text-sm font-medium leading-relaxed">{t.wellnessSanctuaryDesc}</p>
          <div className="grid grid-cols-1 gap-4 pb-20">
              {options.map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => onSelectOption(opt.id as ViewStateName)}
                    className="m3-card p-5 flex items-center gap-5 group bg-white shadow-sm border border-m3-outline/10"
                  >
                      <div className={`w-14 h-14 ${opt.color} text-white rounded-[1.2rem] flex items-center justify-center shadow-md`}>
                          {opt.icon}
                      </div>
                      <div className="flex-1 text-start">
                          <h3 className="text-lg font-bold text-m3-onSurface mb-0.5">{opt.title}</h3>
                          <p className="text-xs text-m3-onSurfaceVariant font-medium">{opt.desc}</p>
                      </div>
                      <ChevronRight size={20} className="text-m3-outline/30" />
                  </button>
              ))}
          </div>
      </main>
    </div>
  );
};

export default WellnessSanctuary;
