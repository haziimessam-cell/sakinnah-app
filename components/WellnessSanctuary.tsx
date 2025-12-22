
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
    { id: 'FADFADA', title: t.ventingOption, desc: isRTL ? 'بوح بكل ما في خاطرك' : 'Express your thoughts', icon: <MessageSquare size={28} />, color: 'bg-ios-azure' },
    { id: 'SLEEP_SANCTUARY', title: t.sleepOption, desc: isRTL ? 'رحلة إلى عالم الأحلام' : 'Journey to dreams', icon: <Moon size={28} />, color: 'bg-ios-azureDeep' },
    { id: 'SOCIAL_SANDBOX', title: t.sandboxOption, desc: isRTL ? 'مختبر المهارات' : 'Skills Laboratory', icon: <Ghost size={28} />, color: 'bg-ios-emerald' },
    { id: 'DREAM', title: t.dreamsOption, desc: isRTL ? 'تحليل اللاوعي' : 'Unconscious analysis', icon: <Sparkles size={28} />, color: 'bg-ios-azure' }
  ];

  return (
    <div className="h-full bg-white flex flex-col pt-safe pb-safe animate-ios-reveal overflow-hidden">
      <header className="px-6 py-10 flex items-center justify-between">
         <button onClick={onBack} className="w-12 h-12 bg-ios-slate rounded-full flex items-center justify-center text-ios-azure">
            {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <h1 className="text-2xl font-bold text-ios-azureDeep">{t.wellnessSanctuary}</h1>
         <div className="w-12"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-4">
          <p className="text-[16px] text-ios-azure/60 px-2 mb-6 font-medium leading-relaxed">{t.wellnessSanctuaryDesc}</p>
          <div className="grid grid-cols-1 gap-4 pb-20">
              {options.map((opt, idx) => (
                  <button 
                    key={opt.id}
                    onClick={() => onSelectOption(opt.id as ViewStateName)}
                    className="ios-card p-6 flex items-center gap-6 group"
                  >
                      <div className={`w-16 h-16 ${opt.color} rounded-[22px] flex items-center justify-center text-white shadow-lg`}>
                          {opt.icon}
                      </div>
                      <div className="flex-1 text-start">
                          <h3 className="text-xl font-bold text-ios-azureDeep mb-0.5">{opt.title}</h3>
                          <p className="text-[14px] text-ios-azure/40 font-semibold">{opt.desc}</p>
                      </div>
                      <ChevronRight size={22} className="text-ios-azure/20" />
                  </button>
              ))}
          </div>
      </main>
    </div>
  );
};

export default WellnessSanctuary;
