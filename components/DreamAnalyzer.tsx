
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { DREAM_SYSTEM_INSTRUCTION_AR, DREAM_SYSTEM_INSTRUCTION_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { ArrowRight, ArrowLeft, Moon, Stars, Send, Mic, MicOff } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
}

const DreamAnalyzer: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [input, setInput] = useState('');
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

      const prompt = input;
      const sysInstruct = language === 'ar' ? DREAM_SYSTEM_INSTRUCTION_AR : DREAM_SYSTEM_INSTRUCTION_EN;
      
      try {
          await initializeChat("Dream Analysis Session", sysInstruct, undefined, language);
          const stream = sendMessageStreamToGemini(prompt, language);
          for await (const chunk of stream) {
              setAnalysis(prev => prev + chunk);
          }
      } catch (e) {
          setAnalysis(language === 'ar' ? 'عذراً، حدث خطأ أثناء الاتصال بعالم الأحلام.' : 'Error connecting to the dream realm.');
      } finally {
          setIsAnalyzing(false);
      }
  };

  return (
    <div className="h-full bg-indigo-950 flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      {/* Starry Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-10 left-10 text-purple-400 animate-pulse"><Stars size={20} /></div>
      <div className="absolute bottom-20 right-20 text-blue-400 animate-pulse" style={{animationDelay: '1s'}}><Stars size={24} /></div>

      <header className="px-4 py-4 z-10 flex items-center gap-3 border-b border-white/10 bg-black/20 backdrop-blur-md">
         <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
             {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <h1 className="text-xl font-bold flex items-center gap-2"><Moon size={20} className="text-purple-300" /> {t.dreamAnalysis}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 no-scrollbar">
          {!analysis && !isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-80">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(167,139,250,0.3)] animate-float">
                      <Moon size={48} className="text-purple-300" />
                  </div>
                  <p className="text-indigo-200 max-w-xs leading-relaxed">{t.dreamAnalysisDesc}</p>
              </div>
          ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 leading-relaxed shadow-xl animate-slideUp">
                  {isAnalyzing && !analysis && (
                      <div className="flex items-center gap-2 text-purple-300 mb-4">
                          <Stars size={16} className="animate-spin" />
                          <span className="text-sm font-bold">{t.interpreting}</span>
                      </div>
                  )}
                  <div className="whitespace-pre-wrap font-medium text-indigo-50 leading-loose">
                      {analysis}
                  </div>
              </div>
          )}
      </main>

      <div className="p-4 bg-black/30 backdrop-blur-xl border-t border-white/10">
          <div className="relative">
              <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? t.listening : t.dreamPlaceholder}
                  className={`w-full bg-white/10 border border-white/20 rounded-2xl p-4 pr-12 text-white placeholder-indigo-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none h-24 transition-all ${isListening ? 'ring-2 ring-red-500/50 bg-red-500/10' : ''}`}
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
                      className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl disabled:opacity-50 transition-colors shadow-lg"
                  >
                      <Send size={18} className={isRTL ? 'rotate-180' : ''} />
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default DreamAnalyzer;
