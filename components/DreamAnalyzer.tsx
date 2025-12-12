
import React, { useState, useRef, useEffect } from 'react';
import { Language, User, JournalEntry } from '../types';
import { translations } from '../translations';
import { DREAM_SYSTEM_INSTRUCTION_AR, DREAM_SYSTEM_INSTRUCTION_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { syncService } from '../services/syncService';
import { ArrowRight, ArrowLeft, Moon, Stars, Send, Mic, MicOff, Key, HeartPulse, Lightbulb, Brain, Save, CheckCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
  user?: User; // Made optional to support quick access, but recommended for saving
}

const DreamAnalyzer: React.FC<Props> = ({ onBack, language, user }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [input, setInput] = useState('');
  const [emotions, setEmotions] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = language === 'ar' ? 'ar-EG' : 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + ' ' + transcript);
            setIsListening(false);
        };
        
        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [language]);

  useEffect(() => {
      if (analysis && resultContainerRef.current) {
          resultContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
  }, [analysis]);

  const toggleListening = () => {
      if (!recognitionRef.current) return;
      if (isListening) {
          recognitionRef.current.stop();
          setIsListening(false);
      } else {
          recognitionRef.current.start();
          setIsListening(true);
      }
  };

  const handleAnalyze = async () => {
      if (!input.trim()) return;
      setIsAnalyzing(true);
      setAnalysis('');
      setIsSaved(false);

      const combinedPrompt = `DREAM NARRATIVE: ${input}\nASSOCIATED EMOTIONS: ${emotions}`;
      const sysInstruct = language === 'ar' ? DREAM_SYSTEM_INSTRUCTION_AR : DREAM_SYSTEM_INSTRUCTION_EN;
      
      try {
          // Initialize fresh context for dream analysis
          await initializeChat("Dream Analysis Session", sysInstruct, undefined, language);
          const stream = sendMessageStreamToGemini(combinedPrompt, language);
          for await (const chunk of stream) {
              setAnalysis(prev => prev + chunk);
          }
      } catch (e) {
          setAnalysis(language === 'ar' ? 'عذراً، حدث خطأ أثناء الاتصال بعالم الأحلام.' : 'Error connecting to the dream realm.');
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleSave = () => {
      if (!analysis || isSaved) return;
      
      const entry: JournalEntry = {
          id: Date.now().toString(),
          date: new Date(),
          text: `🌌 Dream Analysis:\n\nDream: ${input}\nEmotions: ${emotions}\n\nAnalysis:\n${analysis}`,
          tags: ['#Dream', '#Jungian', '#Analysis'],
          sentiment: 'neutral'
      };
      
      const existing = JSON.parse(localStorage.getItem('sakinnah_journal') || '[]');
      localStorage.setItem('sakinnah_journal', JSON.stringify([entry, ...existing]));
      
      if (user) {
          syncService.pushToCloud(user.username);
      }
      
      setIsSaved(true);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  const renderStructuredAnalysis = (text: string) => {
      // Split by specific headers defined in constants.ts
      const parts = text.split('###');
      
      return parts.map((part, index) => {
          if (!part.trim()) return null;
          
          let title = '';
          let content = part;
          let Icon = Stars;
          let bgClass = 'bg-indigo-500/10';
          let borderClass = 'border-indigo-500/30';
          let textClass = 'text-indigo-200';

          // Heuristic matching for headers in case exact strings vary slightly
          const lowerPart = part.toLowerCase();
          
          if (lowerPart.includes('symbol') || lowerPart.includes('رموز') || lowerPart.includes('decoding')) {
              title = language === 'ar' ? 'رموز الأعماق' : 'Symbol Decoding';
              Icon = Key;
              bgClass = 'bg-amber-500/10';
              borderClass = 'border-amber-500/30';
              textClass = 'text-amber-200';
              // Remove the header line from content if present
              content = part.replace(/.*(\n|$)/, '').trim(); 
          } else if (lowerPart.includes('emotion') || lowerPart.includes('شعوري') || lowerPart.includes('core')) {
              title = language === 'ar' ? 'الرسالة الشعورية' : 'Emotional Core';
              Icon = HeartPulse;
              bgClass = 'bg-rose-500/10';
              borderClass = 'border-rose-500/30';
              textClass = 'text-rose-200';
              content = part.replace(/.*(\n|$)/, '').trim();
          } else if (lowerPart.includes('integration') || lowerPart.includes('advice') || lowerPart.includes('دمج') || lowerPart.includes('رسالة')) {
              title = language === 'ar' ? 'دمج الرسالة' : 'Integration & Advice';
              Icon = Lightbulb;
              bgClass = 'bg-teal-500/10';
              borderClass = 'border-teal-500/30';
              textClass = 'text-teal-200';
              content = part.replace(/.*(\n|$)/, '').trim();
          }

          // Fallback for intro text or unstructured parts
          if (!title) return <div key={index} className="whitespace-pre-wrap text-indigo-100/80 mb-4">{part}</div>;

          return (
              <div key={index} className={`rounded-2xl p-5 mb-4 border ${bgClass} ${borderClass} shadow-lg backdrop-blur-md animate-fadeIn transition-all hover:scale-[1.01]`}>
                  <div className={`flex items-center gap-2 mb-3 font-bold text-lg ${textClass} border-b ${borderClass} pb-2`}>
                      <Icon size={20} />
                      <h3>{title}</h3>
                  </div>
                  <div className="text-indigo-50 text-sm leading-relaxed whitespace-pre-wrap opacity-95 font-light">
                      {content}
                  </div>
              </div>
          );
      });
  };

  return (
    <div className="h-full bg-[#0F172A] flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E1B4B] to-[#312E81] z-0"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 text-purple-400/10 animate-float pointer-events-none"><Brain size={180} /></div>
      <div className="absolute bottom-40 right-10 text-blue-400/10 animate-pulse pointer-events-none" style={{animationDelay: '1s'}}><Moon size={120} /></div>
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-ping pointer-events-none" style={{animationDuration: '3s'}}></div>

      <header className="px-4 py-4 z-10 flex items-center justify-between border-b border-white/10 bg-black/30 backdrop-blur-xl">
         <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                 {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
             </button>
             <div>
                 <h1 className="text-lg font-bold flex items-center gap-2 text-indigo-100">
                     <Moon size={18} className="text-purple-300" /> {t.dreamAnalysis}
                 </h1>
                 <p className="text-[10px] text-indigo-300 tracking-wider uppercase font-medium opacity-70">
                     {language === 'ar' ? 'تحليل نفسي عميق (يونغ & جشطالت)' : 'Jungian & Gestalt Analysis'}
                 </p>
             </div>
         </div>
         {analysis && !isAnalyzing && (
             <button 
                onClick={handleSave} 
                disabled={isSaved}
                className={`p-2 rounded-full transition-all ${isSaved ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}
                title={isSaved ? "Saved" : "Save Analysis"}
             >
                 {isSaved ? <CheckCircle size={20} /> : <Save size={20} />}
             </button>
         )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 no-scrollbar pb-32">
          {!analysis && !isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-90 px-6 py-10">
                  <div className="relative">
                      <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse"></div>
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full flex items-center justify-center border border-white/20 shadow-[0_0_40px_rgba(139,92,246,0.3)] relative z-10">
                          <Stars size={40} className="text-indigo-200" />
                      </div>
                  </div>
                  <div>
                      <h2 className="text-xl font-bold text-white mb-2">{language === 'ar' ? 'ماذا رأيت في حلمك؟' : 'What did you see in your dream?'}</h2>
                      <p className="text-indigo-200 text-sm leading-relaxed max-w-xs mx-auto opacity-80">{t.dreamAnalysisDesc}</p>
                  </div>
                  <div className="text-xs text-indigo-300/50 bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                      {language === 'ar' ? 'خصوصية تامة: التحليل يتم محلياً وآمن.' : '100% Private: Analysis is secure.'}
                  </div>
              </div>
          ) : (
              <div className="space-y-6">
                  {isAnalyzing && !analysis && (
                      <div className="flex flex-col items-center justify-center py-20 text-purple-300 space-y-6 animate-fadeIn">
                          <div className="relative w-20 h-20">
                              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                              <div className="absolute inset-0 border-4 border-t-purple-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                              <Stars size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-200 animate-pulse" />
                          </div>
                          <span className="text-sm font-bold tracking-widest uppercase animate-pulse">{t.interpreting}</span>
                      </div>
                  )}
                  {analysis && (
                      <div ref={resultContainerRef} className="space-y-4 pb-24">
                          {renderStructuredAnalysis(analysis)}
                          
                          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                              <p className="text-xs text-indigo-300 mb-3">
                                  {language === 'ar' ? 'هل كان هذا التحليل مفيداً؟' : 'Was this analysis helpful?'}
                              </p>
                              <div className="flex justify-center gap-4">
                                  <button className="text-xl hover:scale-125 transition-transform">👍</button>
                                  <button className="text-xl hover:scale-125 transition-transform">👎</button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}
      </main>

      <div className="p-4 bg-black/60 backdrop-blur-2xl border-t border-white/10 z-20 absolute bottom-0 left-0 right-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-2xl mx-auto space-y-3">
              {/* Emotions Input */}
              <div className="relative group">
                  <HeartPulse size={16} className="absolute top-3 left-3 text-rose-400 z-10 transition-transform group-focus-within:scale-110" />
                  <input 
                      type="text" 
                      value={emotions}
                      onChange={(e) => setEmotions(e.target.value)}
                      placeholder={t.dreamEmotionsPlaceholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-indigo-300/40 focus:ring-1 focus:ring-rose-400/50 focus:bg-white/10 outline-none transition-all"
                  />
              </div>

              {/* Dream Narrative Input */}
              <div className="relative group">
                  <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isListening ? t.listening : t.dreamPlaceholder}
                      className={`w-full bg-white/10 border border-white/20 rounded-2xl p-4 pr-12 text-white placeholder-indigo-300/50 focus:ring-2 focus:ring-purple-500/50 focus:bg-white/15 outline-none resize-none h-28 transition-all text-sm leading-relaxed ${isListening ? 'ring-2 ring-red-500/50 bg-red-500/10 placeholder-red-200' : ''}`}
                  />
                  
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button 
                          onClick={toggleListening}
                          className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40' : 'bg-white/10 text-indigo-200 hover:bg-white/20 hover:text-white'}`}
                          title="Voice Input"
                      >
                          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>
                      <button 
                          onClick={handleAnalyze} 
                          disabled={isAnalyzing || !input.trim()}
                          className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/40 active:scale-95 group-hover:shadow-purple-500/20"
                          title="Analyze Dream"
                      >
                          <Send size={18} className={isRTL ? 'rotate-180' : ''} />
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DreamAnalyzer;
