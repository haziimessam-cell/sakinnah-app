
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { DREAM_SYSTEM_INSTRUCTION_AR, DREAM_SYSTEM_INSTRUCTION_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { ArrowRight, ArrowLeft, Moon, Stars, Send, Mic, MicOff, Key, HeartPulse, Lightbulb, Brain } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
}

const DreamAnalyzer: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [input, setInput] = useState('');
  const [emotions, setEmotions] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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

      const combinedPrompt = `DREAM: ${input}\nEMOTIONS FELT: ${emotions}`;
      const sysInstruct = language === 'ar' ? DREAM_SYSTEM_INSTRUCTION_AR : DREAM_SYSTEM_INSTRUCTION_EN;
      
      try {
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

  const renderStructuredAnalysis = (text: string) => {
      // Split by custom headers we asked AI to use
      const parts = text.split('###');
      return parts.map((part, index) => {
          if (!part.trim()) return null;
          
          let title = '';
          let content = part;
          let Icon = Stars;
          let bgClass = 'bg-indigo-500/10';
          let textClass = 'text-indigo-200';

          if (part.toLowerCase().includes('symbol') || part.includes('الرموز')) {
              title = language === 'ar' ? 'تفكيك الرموز' : 'Symbol Decoding';
              Icon = Key;
              bgClass = 'bg-amber-500/10 border-amber-500/30';
              textClass = 'text-amber-200';
              content = part.replace(/.*(\n)/, ''); // Remove title line
          } else if (part.toLowerCase().includes('emotion') || part.includes('الشعوري')) {
              title = language === 'ar' ? 'العمق الشعوري' : 'Emotional Core';
              Icon = HeartPulse;
              bgClass = 'bg-rose-500/10 border-rose-500/30';
              textClass = 'text-rose-200';
              content = part.replace(/.*(\n)/, '');
          } else if (part.toLowerCase().includes('message') || part.includes('advice') || part.includes('رسالة')) {
              title = language === 'ar' ? 'رسالة اللاوعي' : 'The Unconscious Message';
              Icon = Lightbulb;
              bgClass = 'bg-teal-500/10 border-teal-500/30';
              textClass = 'text-teal-200';
              content = part.replace(/.*(\n)/, '');
          }

          if (!title) return <div key={index} className="whitespace-pre-wrap">{part}</div>;

          return (
              <div key={index} className={`rounded-2xl p-5 mb-4 border ${bgClass} shadow-sm backdrop-blur-sm animate-fadeIn`}>
                  <div className={`flex items-center gap-2 mb-2 font-bold ${textClass}`}>
                      <Icon size={18} />
                      <h3>{title}</h3>
                  </div>
                  <div className="text-indigo-50 text-sm leading-relaxed whitespace-pre-wrap opacity-90">
                      {content.trim()}
                  </div>
              </div>
          );
      });
  };

  return (
    <div className="h-full bg-[#0F172A] flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1E1B4B] to-[#312E81] z-0"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 text-purple-400/20 animate-float"><Brain size={120} /></div>
      <div className="absolute bottom-20 right-20 text-blue-400/20 animate-pulse" style={{animationDelay: '1s'}}><Moon size={80} /></div>

      <header className="px-4 py-4 z-10 flex items-center gap-3 border-b border-white/10 bg-black/20 backdrop-blur-xl">
         <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
             {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <div>
             <h1 className="text-lg font-bold flex items-center gap-2 text-indigo-100">
                 <Moon size={18} className="text-purple-300" /> {t.dreamAnalysis}
             </h1>
             <p className="text-[10px] text-indigo-300 tracking-wider uppercase font-medium">{language === 'ar' ? 'تحليل نفسي عميق' : 'Depth Psychology Lab'}</p>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 no-scrollbar">
          {!analysis && !isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-80 px-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-pulse">
                      <Brain size={40} className="text-indigo-200" />
                  </div>
                  <div>
                      <h2 className="text-xl font-bold text-white mb-2">{language === 'ar' ? 'ماذا رأيت؟' : 'What did you see?'}</h2>
                      <p className="text-indigo-200 text-sm leading-relaxed max-w-xs mx-auto">{t.dreamAnalysisDesc}</p>
                  </div>
              </div>
          ) : (
              <div className="pb-32">
                  {isAnalyzing && !analysis && (
                      <div className="flex flex-col items-center justify-center py-12 text-purple-300 space-y-4">
                          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-bold animate-pulse">{t.interpreting}</span>
                      </div>
                  )}
                  {analysis && (
                      <div className="space-y-4">
                          {renderStructuredAnalysis(analysis)}
                      </div>
                  )}
              </div>
          )}
      </main>

      <div className="p-4 bg-black/40 backdrop-blur-2xl border-t border-white/10 z-20">
          <div className="space-y-3">
              {/* Emotions Input */}
              <div className="relative">
                  <HeartPulse size={16} className="absolute top-3 left-3 text-rose-400 z-10" />
                  <input 
                      type="text" 
                      value={emotions}
                      onChange={(e) => setEmotions(e.target.value)}
                      placeholder={t.dreamEmotionsPlaceholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-indigo-300/50 focus:ring-1 focus:ring-rose-400 outline-none transition-all"
                  />
              </div>

              {/* Dream Narrative Input */}
              <div className="relative">
                  <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={isListening ? t.listening : t.dreamPlaceholder}
                      className={`w-full bg-white/10 border border-white/20 rounded-2xl p-4 pr-12 text-white placeholder-indigo-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none h-24 transition-all text-base leading-relaxed ${isListening ? 'ring-2 ring-red-500/50 bg-red-500/10' : ''}`}
                  />
                  
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button 
                          onClick={toggleListening}
                          className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-indigo-200 hover:bg-white/20'}`}
                      >
                          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                      </button>
                      <button 
                          onClick={handleAnalyze} 
                          disabled={isAnalyzing || !input.trim()}
                          className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg active:scale-95"
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
