
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { sendMessageStreamToGemini, getInitialAISalutation } from '../services/geminiService';
import { ArrowRight, ArrowLeft, Moon, Play, CloudRain, Volume2, Sparkles, X, StopCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
}

const SleepSanctuary: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [isAmbientOn, setIsAmbientOn] = useState(false);

  // عند الدخول، سكينة تبدأ بالترحيب بصوت "الجدة"
  useEffect(() => {
    const initSleep = async () => {
        setIsGenerating(true);
        const greeting = await getInitialAISalutation("sleep_sanctuary_grandma", language, "Persona: Wise Grandma, Storyteller. Mood: Extremely calm, soothing.");
        setStoryText(greeting);
        setIsGenerating(false);
    };
    initSleep();
  }, [language]);

  const startFullStory = async () => {
      setIsGenerating(true);
      setStoryText("");
      try {
          const stream = sendMessageStreamToGemini(isRTL ? "ابدأ الحكاية الآن يا جدتي." : "Start the story now, Grandma.", language);
          let full = "";
          for await (const chunk of stream) {
              full += chunk;
              setStoryText(full);
          }
      } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  return (
    <div className="h-full bg-[#05060B] flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1e1b4b,transparent)] opacity-40"></div>

      <header className="px-8 py-6 z-20 flex items-center justify-between border-b border-white/5">
         <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl border border-white/10 active:scale-90 transition-all">
            {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
         </button>
         <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">{t.sleepWing}</h1>
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Deep Relaxation AI</p>
         </div>
         <button onClick={() => setIsAmbientOn(!isAmbientOn)} className={`p-3 rounded-2xl border transition-all ${isAmbientOn ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10 text-white/40'}`}>
            <CloudRain size={22} />
         </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-10 space-y-12 relative z-10 overflow-y-auto no-scrollbar">
          <div className="w-64 h-64 bg-indigo-500/10 rounded-[4rem] flex items-center justify-center border border-indigo-500/20 shadow-[0_0_100px_rgba(79,70,229,0.1)] relative group">
              <Moon size={100} className="text-indigo-300 animate-float-slow" />
              <div className="absolute inset-0 bg-indigo-500/5 blur-3xl animate-pulse"></div>
              <Sparkles className="absolute top-10 right-10 text-amber-300 animate-pulse" size={24} />
          </div>

          <div className="text-center space-y-6 max-w-md">
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 italic text-indigo-100/90 leading-relaxed font-serif text-lg">
                  {isGenerating && !storyText ? t.aiThinking : storyText}
              </div>
          </div>

          {!isGenerating && (
              <button 
                onClick={startFullStory}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 border border-indigo-400/30"
              >
                  <Play size={24} fill="currentColor" />
                  <span>{t.tellMeStory}</span>
              </button>
          )}

          {storyText && (
              <button onClick={() => setStoryText("")} className="text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-red-400 transition-colors">
                  <StopCircle size={16} />
                  {t.endSession}
              </button>
          )}
      </main>

      <div className="p-10 text-center opacity-20 pointer-events-none">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-400">{isRTL ? 'محرك الحكواتي الرقمي نشط' : 'DIGITAL STORYTELLER ACTIVE'}</p>
      </div>
    </div>
  );
};

export default SleepSanctuary;
