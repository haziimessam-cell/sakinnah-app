
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language, User, JournalEntry } from '../types';
import { translations } from '../translations';
import { DREAM_SYSTEM_INSTRUCTION_AR, DREAM_SYSTEM_INSTRUCTION_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { syncService } from '../services/syncService';
import { liveVoiceService } from '../services/liveVoiceService';
import { ArrowRight, ArrowLeft, Moon, Stars, Send, Mic, MicOff, Key, HeartPulse, Lightbulb, Brain, Save, CheckCircle, Sparkles, Wand2, X, Volume2, MessageSquareText, Phone } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
  user: User;
}

type Mode = 'selection' | 'text' | 'voice';

const DreamAnalyzer: React.FC<Props> = ({ onBack, language, user }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [activeMode, setActiveMode] = useState<Mode>('selection');
  const [inputText, setInputText] = useState('');
  const [emotions, setEmotions] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListeningText, setIsListeningText] = useState(false); // For STT in text mode
  const [isSaved, setIsSaved] = useState(false);
  const [alchemyStep, setAlchemyStep] = useState(0);
  
  // Voice Mode State
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [userVolume, setUserVolume] = useState(0);

  const recognitionRef = useRef<any>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);

  // Setup Speech Recognition for Text Mode only
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = language === 'ar' ? 'ar-EG' : 'en-US';
        recognitionRef.current.onresult = (event: any) => {
            setInputText(prev => prev + ' ' + event.results[0][0].transcript);
            setIsListeningText(false);
        };
    }
  }, [language]);

  useEffect(() => {
      if (analysis && resultContainerRef.current) {
          resultContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
  }, [analysis]);

  const startVoiceMode = useCallback(() => {
      setActiveMode('voice');
      const sysInstruct = language === 'ar' ? DREAM_SYSTEM_INSTRUCTION_AR : DREAM_SYSTEM_INSTRUCTION_EN;
      
      liveVoiceService.connect({
          voiceName: 'Charon',
          systemInstruction: `${sysInstruct}\n\nUser Name: ${user.name}. Start by inviting the user to describe their dream in their own voice. Be slow and hypnotic.`,
          onTranscript: (text) => setVoiceTranscript(prev => prev + text),
          onVolumeUpdate: (v) => setUserVolume(v),
          onError: (e) => {
              console.error(e);
              setActiveMode('selection');
              alert(isRTL ? "فشل الاتصال الصوتي." : "Voice connection failed.");
          }
      });
  }, [language, user.name, isRTL]);

  const stopVoiceMode = useCallback(() => {
      liveVoiceService.stop();
      if (voiceTranscript) {
          // Auto-save voice transcript to journal if possible
          const entry: JournalEntry = {
              id: Date.now().toString(),
              date: new Date(),
              text: `🎙️ Voice Dream Dive for ${user.name}:\n\n${voiceTranscript}`,
              tags: ['#DreamDive', '#Voice'],
              sentiment: 'neutral'
          };
          const existing = JSON.parse(localStorage.getItem('sakinnah_journal') || '[]');
          localStorage.setItem('sakinnah_journal', JSON.stringify([entry, ...existing]));
          syncService.pushToCloud(user.username);
      }
      setActiveMode('selection');
      setVoiceTranscript('');
  }, [user.name, user.username, voiceTranscript]);

  const handleAnalyzeText = async () => {
      if (!inputText.trim()) return;
      setIsAnalyzing(true);
      setAnalysis('');
      setIsSaved(false);
      setAlchemyStep(1);

      const stepTimer = setInterval(() => {
          setAlchemyStep(prev => (prev < 3 ? prev + 1 : prev));
      }, 3000);

      try {
          const sysInstruct = language === 'ar' ? DREAM_SYSTEM_INSTRUCTION_AR : DREAM_SYSTEM_INSTRUCTION_EN;
          await initializeChat(`Dreamer Name: ${user.name}`, sysInstruct, undefined, language);
          
          const combinedPrompt = `DREAM: ${inputText}\nEMOTIONS: ${emotions}`;
          const stream = sendMessageStreamToGemini(combinedPrompt, language);
          
          let fullText = "";
          for await (const chunk of stream) {
              fullText += chunk;
              setAnalysis(fullText);
          }
      } catch (e) {
          setAnalysis(isRTL ? "فشلنا في الوصول لمستودع الأحلام حالياً." : "Failed to reach the dream repository.");
      } finally {
          clearInterval(stepTimer);
          setIsAnalyzing(false);
      }
  };

  const handleSaveText = () => {
      if (!analysis || isSaved) return;
      const entry: JournalEntry = {
          id: Date.now().toString(),
          date: new Date(),
          text: `🌌 Dream Analysis for ${user.name}:\n\nDream: ${inputText}\n\n${analysis}`,
          tags: ['#DreamProbe', '#Psychology'],
          sentiment: 'neutral'
      };
      const existing = JSON.parse(localStorage.getItem('sakinnah_journal') || '[]');
      localStorage.setItem('sakinnah_journal', JSON.stringify([entry, ...existing]));
      syncService.pushToCloud(user.username);
      setIsSaved(true);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  const renderAnalysisParts = (text: string) => {
      const parts = text.split('###');
      return parts.map((part, i) => {
          if (!part.trim()) return null;
          let Icon = Sparkles;
          let color = "indigo";
          if (part.includes('رموز') || part.includes('Symbol')) { Icon = Key; color = "amber"; }
          if (part.includes('النبض') || part.includes('Emotional')) { Icon = HeartPulse; color = "rose"; }
          if (part.includes('تكامل') || part.includes('Integration')) { Icon = Lightbulb; color = "teal"; }

          const lines = part.trim().split('\n');
          const title = lines[0];
          const content = lines.slice(1).join('\n');

          return (
              <div key={i} className={`bg-white/5 backdrop-blur-2xl border border-${color}-500/20 rounded-[2rem] p-6 mb-6 animate-slideUp shadow-xl`} style={{ animationDelay: `${i * 150}ms` }}>
                  <div className={`flex items-center gap-3 mb-4 text-${color}-300`}>
                      <div className={`p-2 bg-${color}-500/10 rounded-xl`}><Icon size={22} /></div>
                      <h3 className="font-bold text-lg">{title}</h3>
                  </div>
                  <div className="text-indigo-100/90 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {content}
                  </div>
              </div>
          );
      });
  };

  // Shared background
  const renderNebulaBackground = () => (
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] rounded-full blur-[140px] animate-breathing opacity-80 transition-all duration-[2s] bg-indigo-900/30`}
            style={{ transform: activeMode === 'voice' ? `translate(-50%, -50%) scale(${1 + userVolume * 2})` : 'translate(-50%, -50%) scale(1)' }}
          ></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
          {activeMode === 'voice' && (
              <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-white/40 rounded-full animate-ping"></div>
          )}
      </div>
  );

  return (
    <div className="h-full bg-[#050510] flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      {renderNebulaBackground()}

      <header className="px-6 py-4 z-20 flex items-center justify-between bg-black/40 backdrop-blur-xl border-b border-white/5">
         <div className="flex items-center gap-4">
             <button onClick={activeMode === 'selection' ? onBack : () => { stopVoiceMode(); setActiveMode('selection'); }} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
                 {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
             </button>
             <div>
                 <h1 className="text-xl font-black text-indigo-100 flex items-center gap-2">
                     <Brain size={20} className="text-indigo-400" /> {t.dreamAnalysis}
                 </h1>
                 <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{t.dreamPortalTitle}</p>
             </div>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 relative z-10 no-scrollbar">
          
          {/* MODE SELECTION */}
          {activeMode === 'selection' && (
              <div className="flex flex-col items-center justify-center h-full space-y-8 animate-slideUp">
                   <div className="w-32 h-32 bg-indigo-600/10 rounded-[3rem] flex items-center justify-center border-2 border-indigo-500/20 animate-pulse">
                        <Stars size={64} className="text-indigo-300" />
                   </div>
                   <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black">{isRTL ? 'كيف تريد البدء؟' : 'How to start?'}</h2>
                        <p className="text-indigo-200/60 text-sm max-w-xs">{t.dreamAnalysisDesc}</p>
                   </div>
                   <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                        <button onClick={() => setActiveMode('text')} className="w-full bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-5 hover:bg-white/10 transition-all active:scale-95 group">
                             <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <MessageSquareText size={32} />
                             </div>
                             <div className="text-start">
                                <h4 className="font-black text-xl">{t.dreamTextMode}</h4>
                                <p className="text-xs text-indigo-300/50">{isRTL ? 'دوّن حلمك بالكلمات' : 'Write your dream down'}</p>
                             </div>
                        </button>

                        <button onClick={startVoiceMode} className="w-full bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-5 hover:bg-white/10 transition-all active:scale-95 group">
                             <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                <Mic size={32} />
                             </div>
                             <div className="text-start">
                                <h4 className="font-black text-xl">{t.dreamVoiceMode}</h4>
                                <p className="text-xs text-indigo-300/50">{t.dreamVoiceDesc}</p>
                             </div>
                        </button>
                   </div>
              </div>
          )}

          {/* TEXT MODE */}
          {activeMode === 'text' && (
              <div className="h-full flex flex-col">
                  {!analysis && !isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-slideUp">
                          <div className="w-full max-w-sm space-y-4">
                              <div className="relative">
                                  <textarea 
                                      value={inputText}
                                      onChange={(e) => setInputText(e.target.value)}
                                      placeholder={t.dreamPlaceholder}
                                      className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-indigo-50 placeholder-indigo-300/30 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none h-56 text-sm font-medium"
                                  />
                                  <button 
                                    onClick={() => { if(recognitionRef.current) { setIsListeningText(true); recognitionRef.current.start(); } }}
                                    className={`absolute bottom-4 right-4 p-3 rounded-2xl transition-all ${isListeningText ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30' : 'bg-white/10 hover:bg-white/20'}`}
                                  >
                                    {isListeningText ? <MicOff size={18} /> : <Mic size={18} />}
                                  </button>
                              </div>
                              <input 
                                type="text"
                                value={emotions}
                                onChange={(e) => setEmotions(e.target.value)}
                                placeholder={t.dreamEmotionsPlaceholder}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none text-indigo-50 placeholder-indigo-300/30"
                              />
                              <button 
                                onClick={handleAnalyzeText}
                                disabled={!inputText.trim()}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-800 text-white rounded-3xl font-black text-lg shadow-2xl shadow-indigo-900/50 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                              >
                                  <Wand2 size={24} />
                                  <span>{isRTL ? 'ابدأ الخيمياء النفسية' : 'Start Soul Alchemy'}</span>
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-6 pb-32">
                          {isAnalyzing && (
                              <div className="flex flex-col items-center justify-center py-20 text-indigo-300 space-y-8 animate-fadeIn">
                                  <div className="relative w-32 h-32 flex items-center justify-center">
                                      <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
                                      <div className="absolute inset-0 border-t-4 border-indigo-400 rounded-full animate-spin"></div>
                                      <Brain size={40} className="text-indigo-200 animate-pulse" />
                                  </div>
                                  <div className="text-center space-y-2">
                                      <p className="text-lg font-black uppercase tracking-widest">{t.interpreting}</p>
                                      <p className="text-xs text-indigo-400/60 font-bold italic animate-pulse">
                                          {t[`dreamAlchemyStep${alchemyStep}`]}
                                      </p>
                                  </div>
                              </div>
                          )}
                          {analysis && (
                              <div ref={resultContainerRef} className="animate-fadeIn">
                                  {renderAnalysisParts(analysis)}
                                  
                                  {!isAnalyzing && (
                                      <div className="flex flex-col gap-4 mt-12 animate-slideUp">
                                          <button 
                                              onClick={handleSaveText} 
                                              disabled={isSaved}
                                              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${isSaved ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10 shadow-xl'}`}
                                          >
                                              {isSaved ? <CheckCircle size={20} /> : <Save size={20} />}
                                              <span>{isSaved ? (isRTL ? 'تم الحفظ في الصندوق' : 'Saved to Box') : t.dreamSaveToSecret}</span>
                                          </button>
                                          <button onClick={() => { setAnalysis(''); setInputText(''); }} className="w-full py-4 text-indigo-400 text-sm font-bold hover:text-indigo-200 transition-colors">
                                              {t.dreamBackToWorld}
                                          </button>
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  )}
              </div>
          )}

          {/* VOICE MODE */}
          {activeMode === 'voice' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-12 animate-fadeIn">
                  <div className="relative">
                      <div 
                        className="absolute inset-[-40px] border border-primary-500/10 rounded-full animate-pulse-ring"
                        style={{ transform: `scale(${1 + userVolume * 3})`, opacity: Math.max(0.1, userVolume * 5) }}
                      ></div>
                      <div className={`w-64 h-64 bg-gradient-to-br from-indigo-600/20 to-purple-800/20 rounded-full flex items-center justify-center border-4 border-white/10 shadow-2xl relative z-10 transition-all duration-300 ${userVolume > 0.05 ? 'scale-105' : 'scale-100'}`}>
                          <Volume2 size={100} className={`text-indigo-200 transition-all ${userVolume > 0.05 ? 'animate-pulse' : 'opacity-40'}`} />
                      </div>
                  </div>

                  <div className="space-y-6 max-w-sm w-full">
                      <div className="space-y-1">
                          <h2 className="text-3xl font-black tracking-tight">{isRTL ? 'غوص في اللاوعي' : 'Dive into Subconscious'}</h2>
                          <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em]">{t.listening}</p>
                      </div>

                      <div className="min-h-[100px] bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 relative overflow-hidden">
                          {voiceTranscript ? (
                              <p className="text-indigo-100 text-lg font-medium leading-relaxed animate-fadeIn line-clamp-4 italic">
                                  "{voiceTranscript}"
                              </p>
                          ) : (
                              <div className="flex flex-col items-center gap-3 opacity-40 py-4">
                                  <div className="flex gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay:'0s'}}></div>
                                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
                                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                                  </div>
                                  <p className="text-white text-[10px] font-bold uppercase tracking-widest">{isRTL ? 'احكِ لي حلمك...' : 'Describe your dream...'}</p>
                              </div>
                          )}
                      </div>

                      <button 
                        onClick={stopVoiceMode}
                        className="w-full py-5 bg-red-600/90 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-red-900/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
                      >
                          <Phone size={24} className="rotate-[135deg]" />
                          <span>{t.dreamStopVoice}</span>
                      </button>
                  </div>
              </div>
          )}

      </main>

      <style>{`
          .animate-spin { animation: spin 2s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes pulse-ring {
              0% { transform: scale(0.8); opacity: 0.5; }
              100% { transform: scale(2.5); opacity: 0; }
          }
          .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
      `}</style>
    </div>
  );
};

export default DreamAnalyzer;
