
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language, User, JournalEntry } from '../types';
import { translations } from '../translations';
import { DREAM_SYSTEM_INSTRUCTION_AR, DREAM_SYSTEM_INSTRUCTION_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { syncService } from '../services/syncService';
import { liveVoiceService } from '../services/liveVoiceService';
// Added Loader2 to imports from lucide-react
import { ArrowRight, ArrowLeft, Moon, Stars, Send, Mic, MicOff, Key, HeartPulse, Lightbulb, Brain, Save, CheckCircle, Sparkles, Wand2, X, Volume2, MessageSquareText, Phone, Loader2 } from 'lucide-react';

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
  const [isListeningText, setIsListeningText] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [alchemyStep, setAlchemyStep] = useState(0);
  
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [userVolume, setUserVolume] = useState(0);

  const recognitionRef = useRef<any>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);

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

  const startVoiceMode = useCallback(() => {
      setActiveMode('voice');
      const voiceForDream = language === 'ar' ? 'Charon' : 'Zephyr';
      const sysInstruct = language === 'ar' ? DREAM_SYSTEM_INSTRUCTION_AR : DREAM_SYSTEM_INSTRUCTION_EN;
      
      const personalizedInstruction = language === 'ar' 
        ? `${sysInstruct}\n\nنادِ المستخدم باسمه: ${user.name}. ابدأ بدعوة المستخدم لسرد حلمه بأسلوب هادئ ومنوم.`
        : `${sysInstruct}\n\nSpeak EXCLUSIVELY in English. Call the user by name: ${user.name}. Start by inviting the user to describe their dream in a slow, hypnotic English tone.`;

      liveVoiceService.connect({
          voiceName: voiceForDream,
          systemInstruction: personalizedInstruction,
          onTranscript: (text) => setVoiceTranscript(prev => prev + text),
          onVolumeUpdate: (v) => setUserVolume(v),
          onError: (e) => {
              console.error(e);
              setActiveMode('selection');
          }
      });
  }, [language, user.name]);

  const stopVoiceMode = useCallback(() => {
      liveVoiceService.stop();
      if (voiceTranscript) {
          const entry: JournalEntry = {
              id: Date.now().toString(),
              date: new Date(),
              text: `🎙️ ${language === 'ar' ? 'رحلة صوتية في الحلم' : 'Voice Dream Dive'} for ${user.name}:\n\n${voiceTranscript}`,
              tags: ['#DreamDive', '#Voice'],
              sentiment: 'neutral'
          };
          const existing = JSON.parse(localStorage.getItem('sakinnah_journal') || '[]');
          localStorage.setItem('sakinnah_journal', JSON.stringify([entry, ...existing]));
          syncService.pushToCloud(user.username);
      }
      setActiveMode('selection');
      setVoiceTranscript('');
  }, [user.name, user.username, voiceTranscript, language]);

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
          await initializeChat(`Dreamer: ${user.name}`, sysInstruct, undefined, language);
          const combinedPrompt = `DREAM: ${inputText}\nEMOTIONS: ${emotions}`;
          const stream = sendMessageStreamToGemini(combinedPrompt, language);
          let fullText = "";
          for await (const chunk of stream) {
              fullText += chunk;
              setAnalysis(fullText);
          }
      } catch (e) {
          setAnalysis(isRTL ? "فشلنا في الوصول لمستودع الأحلام حالياً." : "Dream repository unreachable.");
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
              <div key={i} className={`bg-white/5 backdrop-blur-2xl border border-${color}-500/20 rounded-[2rem] p-6 mb-6 animate-slideUp`}>
                  <div className={`flex items-center gap-3 mb-4 text-${color}-300`}>
                      <div className={`p-2 bg-${color}-500/10 rounded-xl`}><Icon size={22} /></div>
                      <h3 className="font-bold text-lg">{title}</h3>
                  </div>
                  <div className="text-indigo-100/90 text-sm leading-relaxed whitespace-pre-wrap font-medium">{content}</div>
              </div>
          );
      });
  };

  return (
    <div className="h-full bg-[#050510] flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
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
          {activeMode === 'selection' && (
              <div className="flex flex-col items-center justify-center h-full space-y-8 animate-slideUp">
                   <Stars size={64} className="text-indigo-300 animate-pulse" />
                   <h2 className="text-3xl font-black">{isRTL ? 'كيف تريد البدء؟' : 'Choose Your Path'}</h2>
                   <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                        <button onClick={() => setActiveMode('text')} className="w-full bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-5 hover:bg-white/10 transition-all">
                             <MessageSquareText size={32} className="text-blue-400" />
                             <div className="text-start">
                                <h4 className="font-black text-xl">{t.dreamTextMode}</h4>
                                <p className="text-xs text-indigo-300/50">{isRTL ? 'دوّن حلمك بالكلمات' : 'Write your dream'}</p>
                             </div>
                        </button>
                        <button onClick={startVoiceMode} className="w-full bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-5 hover:bg-white/10 transition-all">
                             <Mic size={32} className="text-purple-400" />
                             <div className="text-start">
                                <h4 className="font-black text-xl">{t.dreamVoiceMode}</h4>
                                <p className="text-xs text-indigo-300/50">{t.dreamVoiceDesc}</p>
                             </div>
                        </button>
                   </div>
              </div>
          )}
          {activeMode === 'text' && (
              <div className="h-full flex flex-col">
                  {!analysis && !isAnalyzing ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-6">
                          <textarea 
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              placeholder={t.dreamPlaceholder}
                              className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-indigo-50 h-56 resize-none"
                          />
                          <button onClick={handleAnalyzeText} disabled={!inputText.trim()} className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-800 text-white rounded-3xl font-black">
                             {isRTL ? 'ابدأ الخيمياء النفسية' : 'Begin Soul Alchemy'}
                          </button>
                      </div>
                  ) : (
                      <div className="space-y-6 pb-32">
                          {isAnalyzing && <Loader2 className="animate-spin mx-auto text-indigo-400" size={48} />}
                          {analysis && renderAnalysisParts(analysis)}
                      </div>
                  )}
              </div>
          )}
          {activeMode === 'voice' && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-12">
                  <div className={`w-64 h-64 bg-gradient-to-br from-indigo-600/20 to-purple-800/20 rounded-full flex items-center justify-center border-4 border-white/10 shadow-2xl transition-all duration-300 ${userVolume > 0.05 ? 'scale-105' : 'scale-100'}`}>
                      <Volume2 size={100} className={`text-indigo-200 ${userVolume > 0.05 ? 'animate-pulse' : 'opacity-40'}`} />
                  </div>
                  <h2 className="text-3xl font-black">{isRTL ? 'غوص في اللاوعي' : 'Dive Deep'}</h2>
                  <button onClick={stopVoiceMode} className="w-full py-5 bg-red-600/90 text-white rounded-[2rem] font-black">
                      <Phone size={24} className="rotate-[135deg] inline mr-2" /> {t.dreamStopVoice}
                  </button>
              </div>
          )}
      </main>
    </div>
  );
};

export default DreamAnalyzer;
