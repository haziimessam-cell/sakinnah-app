
import React, { useState } from 'react';
import { Language, Category } from '../types';
import { translations } from '../translations';
import { MessageSquare, PhoneCall, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  language: Language;
  category: Category;
  onBack: () => void;
  onSelect: (mode: 'text' | 'voice') => void;
}

const ConversationModePicker: React.FC<Props> = ({ language, category, onBack, onSelect }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [selected, setSelected] = useState<'text' | 'voice'>('text');

  return (
    <div className="h-full bg-ios-slate flex flex-col pt-safe pb-safe animate-ios-reveal overflow-hidden relative">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between z-10">
        <button onClick={onBack} className="text-ios-azure font-semibold flex items-center gap-1">
            {isRTL ? <ChevronRight size={24} /> : <ChevronRight className="rotate-180" size={24} />}
            <span className="text-[17px]">{isRTL ? 'رجوع' : 'Back'}</span>
        </button>
        <h1 className="text-[17px] font-bold">{t.chooseMode}</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 flex flex-col p-6 space-y-6">
          <div className="text-center py-6 space-y-2">
              <h2 className="text-3xl font-extrabold text-ios-label tracking-tight">{isRTL ? 'ابدأ الجلسة' : 'Start Session'}</h2>
              <p className="text-[15px] text-ios-secondary font-medium">{isRTL ? 'اختر الوسيلة التي تشعرك بالراحة اليوم' : 'Pick the mode that suits you best today'}</p>
          </div>

          <div className="space-y-3">
              <button 
                onClick={() => setSelected('text')}
                className={`w-full p-5 rounded-[22px] border transition-all flex items-center gap-5 text-start ${selected === 'text' ? 'bg-white border-ios-azure shadow-md' : 'bg-white/50 border-black/5'}`}
              >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected === 'text' ? 'bg-ios-azure text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <MessageSquare size={24} />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-bold text-[17px] text-ios-label">{t.textMode}</h3>
                      <p className="text-[13px] text-ios-secondary font-medium leading-tight">{t.textModeDesc}</p>
                  </div>
              </button>

              <button 
                onClick={() => setSelected('voice')}
                className={`w-full p-5 rounded-[22px] border transition-all flex items-center gap-5 text-start ${selected === 'voice' ? 'bg-white border-ios-azure shadow-md' : 'bg-white/50 border-black/5'}`}
              >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected === 'voice' ? 'bg-ios-azure text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <PhoneCall size={24} />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-bold text-[17px] text-ios-label">{t.voiceMode}</h3>
                      <p className="text-[13px] text-ios-secondary font-medium leading-tight">{t.voiceModeDesc}</p>
                  </div>
              </button>
          </div>

          <div className="mt-auto pt-6">
              <button 
                onClick={() => onSelect(selected)}
                className="w-full py-4 bg-ios-azure text-white rounded-2xl font-bold text-[17px] shadow-lg shadow-ios-azure/20 active:brightness-90 transition-all flex items-center justify-center gap-2"
              >
                  {t.startConversation}
              </button>
          </div>
      </main>
    </div>
  );
};

export default ConversationModePicker;
