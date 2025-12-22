
import React, { useState, useEffect, useRef } from 'react';
import { Language, User, Role } from '../types';
import { translations } from '../translations';
import { sendMessageStreamToGemini, initializeChat, getInitialAISalutation } from '../services/geminiService';
import { ArrowRight, ArrowLeft, Moon, Stars, Send, Sparkles, Key, KeyRound, Brain, History } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
}

const DreamAnalyzer: React.FC<Props> = ({ onBack, language, user }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiGreeting, setAiGreeting] = useState('');

  // Fixed: Corrected initializeChat call and getInitialAISalutation parameters
  useEffect(() => {
    const initDreamSession = async () => {
        setIsAnalyzing(true);
        await initializeChat("Dreamer", t.dreamSystemInstruction, undefined, language);
        // language is 2nd argument, context is 3rd
        const greeting = await getInitialAISalutation('dream_analysis', language, 'mystic_lead');
        setAiGreeting(greeting);
        setIsAnalyzing(false);
    };
    initDreamSession();
  }, [language, t.dreamSystemInstruction]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setAnalysis('');
    try {
        const stream = sendMessageStreamToGemini(input, language);
        let full = '';
        for await (const chunk of stream) {
            full += chunk;
            setAnalysis(full);
        }
    } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="h-full bg-[#030712] flex flex-col pt-safe pb-safe text-white overflow-hidden animate-fadeIn relative">
      {/* Immersive Background Star Field Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#4c1d95,transparent_50%)] opacity-40"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      
      <header className="px-8 py-8 border-b border-white/10 bg-black/40 backdrop-blur-3xl z-20 flex items-center justify-between">
        <div className="flex items-center gap-5">
            <button onClick={onBack} className="p-3 bg-white/5 border border-white/10 rounded-2xl active:scale-90 transition-all hover:bg-mystic-500/20">
                {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
            </button>
            <div>
                <h1 className="text-base font-black tracking-widest uppercase text-mystic-400">{t.dreamWing}</h1>
                <p className="text-[8px] font-black text-white/30 tracking-widest uppercase">Deep Consciousness Protocol v4.1</p>
            </div>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl"><Moon size={24} className="text-mystic-400 animate-pulse-soft" /></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-10 z-10 space-y-12">
        {!analysis && !isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-12 animate-reveal">
                <div className="relative group">
                    <div className="absolute inset-0 bg-mystic-500/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-[3000ms]"></div>
                    <Stars size={100} className="text-mystic-300 animate-float-slow relative z-10" />
                    <Sparkles className="absolute -top-6 -right-6 text-amber-300 animate-pulse relative z-10" size={32} />
                </div>
                <div className="space-y-6">
                    <h2 className="text-4xl font-black italic tracking-tighter font-serif">{isRTL ? 'بوابة الأحلام' : 'Portal of Dreams'}</h2>
                    <div className="bg-white/5 p-8 rounded-[3.5rem] border border-white/10 italic text-mystic-200 text-sm leading-relaxed max-w-md font-medium backdrop-blur-xl">
                        {aiGreeting || (isRTL ? "أخبرني عما رأيت في منامك، وسأكشف لك ما وراء الصور..." : "Tell me about your vision, I will reveal what lies beneath...")}
                    </div>
                </div>
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[3rem] p-10 text-white h-64 resize-none outline-none focus:border-mystic-500/50 transition-all text-base leading-relaxed font-medium placeholder-white/20"
                    placeholder={isRTL ? "صف حلمك، الألوان، الرموز، والمشاعر التي أيقظك بها..." : "Describe colors, symbols, feelings that lingered..."}
                />
                <button onClick={handleAnalyze} className="w-full h-24 bg-mystic-600 rounded-[3rem] font-black uppercase tracking-[0.5em] text-lg shadow-[0_20px_50px_rgba(139,92,246,0.3)] flex items-center justify-center gap-6 active:scale-95 transition-all border border-mystic-400/30">
                    <span>{isRTL ? 'فك رموز الحلم' : 'Decode Vision'}</span>
                    <KeyRound size={28} />
                </button>
            </div>
        ) : (
            <div className="space-y-8 pb-32">
                {isAnalyzing && !analysis && (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-16 h-16 border-4 border-mystic-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-mystic-300 animate-pulse">{t.analyzing}</p>
                    </div>
                )}
                {analysis && (
                    <div className="bg-white/5 border border-white/10 rounded-[4rem] p-12 backdrop-blur-3xl animate-fadeIn shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-20 -left-20 w-60 h-60 bg-mystic-500/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-[3000ms]"></div>
                        <div className="flex items-center gap-5 mb-10 text-mystic-400">
                            <div className="p-3 bg-mystic-500/10 rounded-2xl"><Brain size={32} /></div>
                            <h3 className="font-black uppercase tracking-[0.3em] text-xl">{isRTL ? 'تحليل البصيرة' : 'Insight Analysis'}</h3>
                        </div>
                        <p className="text-mystic-100 text-xl leading-[1.8] italic font-medium whitespace-pre-wrap font-serif">
                            {analysis}
                        </p>
                        <button onClick={() => setAnalysis('')} className="mt-12 w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] transition-all">
                             {isRTL ? 'تحليل حلم آخر' : 'Analyze Another Dream'}
                        </button>
                    </div>
                )}
            </div>
        )}
      </main>
      
      <div className="absolute bottom-10 left-0 w-full text-center opacity-20 pointer-events-none z-0">
          <p className="text-[9px] font-black tracking-[0.6em] uppercase">Subconscious Connection Active</p>
      </div>
    </div>
  );
};

export default DreamAnalyzer;
