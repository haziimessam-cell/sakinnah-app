
import React, { useState } from 'react';
import { Language, Category } from '../types';
import { translations } from '../translations';
import { MessageSquare, PhoneCall, ArrowLeft, ArrowRight, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

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
    <div className="h-full bg-slate-50 flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary-100/30 rounded-full blur-[100px] pointer-events-none"></div>
      
      <header className="px-6 py-5 flex items-center gap-4 bg-white/60 backdrop-blur-xl border-b border-slate-100 z-10">
        <button onClick={onBack} className="p-2.5 bg-white shadow-sm rounded-xl text-slate-400 border border-slate-100 active:scale-90 transition-all">
          {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight">{t.chooseMode}</h1>
          <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest">{t[`cat_${category.id}_title`]}</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 relative z-10">
          <div className="text-center max-w-xs space-y-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary-500 shadow-xl border border-slate-100 mx-auto animate-float">
                  <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{isRTL ? 'كيف تفضل التواصل اليوم؟' : 'How would you like to connect?'}</h2>
          </div>

          <div className="w-full max-w-sm space-y-4">
              {/* Text Mode Card */}
              <button 
                onClick={() => setSelected('text')}
                className={`w-full p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-5 text-start relative group overflow-hidden ${selected === 'text' ? 'bg-white border-primary-500 shadow-2xl shadow-primary-500/10' : 'bg-white/50 border-white shadow-sm hover:bg-white'}`}
              >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selected === 'text' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <MessageSquare size={28} />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-black text-slate-800 text-lg">{t.textMode}</h3>
                      <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{t.textModeDesc}</p>
                  </div>
                  {selected === 'text' && <div className="absolute top-4 right-6 text-primary-500"><ShieldCheck size={18} /></div>}
              </button>

              {/* Voice Mode Card */}
              <button 
                onClick={() => setSelected('voice')}
                className={`w-full p-6 rounded-[2.5rem] border-2 transition-all flex items-center gap-5 text-start relative group overflow-hidden ${selected === 'voice' ? 'bg-white border-indigo-500 shadow-2xl shadow-indigo-500/10' : 'bg-white/50 border-white shadow-sm hover:bg-white'}`}
              >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selected === 'voice' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <PhoneCall size={28} />
                  </div>
                  <div className="flex-1">
                      <h3 className="font-black text-slate-800 text-lg">{t.voiceMode}</h3>
                      <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{t.voiceModeDesc}</p>
                  </div>
                  {selected === 'voice' && <div className="absolute top-4 right-6 text-indigo-500"><ShieldCheck size={18} /></div>}
              </button>
          </div>
      </main>

      <footer className="p-8 bg-white/40 backdrop-blur-md border-t border-slate-100">
          <button 
            onClick={() => onSelect(selected)}
            className={`w-full py-5 rounded-[2rem] font-black text-white shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${selected === 'text' ? 'bg-primary-600 shadow-primary-500/30' : 'bg-indigo-600 shadow-indigo-500/30'}`}
          >
              <span className="uppercase tracking-[0.2em] text-xs">{t.startConversation}</span>
              <ChevronRight size={20} className={isRTL ? 'rotate-180' : ''} />
          </button>
      </footer>
    </div>
  );
};

export default ConversationModePicker;
