import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { SLEEP_STORY_PROMPT_AR, SLEEP_STORY_PROMPT_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat } from '../services/geminiService';
import { ArrowRight, ArrowLeft, Moon, Stars, Clock, BookOpen, Send, Mic, Play, Pause, StopCircle, X } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
}

const SleepSanctuary: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [activeTab, setActiveTab] = useState<'calculator' | 'story'>('calculator');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [bedtimes, setBedtimes] = useState<string[]>([]);
  
  const [storyTopic, setStoryTopic] = useState('');
  const [storyText, setStoryText] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // SLEEP CALCULATOR LOGIC
  const calculateSleep = () => {
      const [hours, mins] = wakeTime.split(':').map(Number);
      const wakeDate = new Date();
      wakeDate.setHours(hours, mins, 0);

      const cycles = [6, 5, 4]; // 9h, 7.5h, 6h
      const times = cycles.map(c => {
          const sleepDate = new Date(wakeDate.getTime() - (c * 90 * 60000));
          return sleepDate.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
      });
      setBedtimes(times);
  };

  // STORY GENERATOR LOGIC
  const generateStory = async () => {
      if (!storyTopic.trim()) return;
      setIsGeneratingStory(true);
      setStoryText('');
      window.speechSynthesis.cancel();
      
      const prompt = language === 'ar' 
          ? SLEEP_STORY_PROMPT_AR.replace('[Topic]', storyTopic)
          : SLEEP_STORY_PROMPT_EN.replace('[Topic]', storyTopic);

      try {
          await initializeChat("Sleep Story Session", prompt, undefined, language);
          const stream = sendMessageStreamToGemini("Start story", language);
          for await (const chunk of stream) {
              setStoryText(prev => prev + chunk);
          }
      } catch (e) {
          setStoryText("Error generating story.");
      } finally {
          setIsGeneratingStory(false);
      }
  };

  const toggleSpeech = () => {
      if (isSpeaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
      } else if (storyText) {
          const utterance = new SpeechSynthesisUtterance(storyText);
          utterance.lang = language === 'ar' ? 'ar-EG' : 'en-US';
          utterance.rate = 0.8; // Slower for sleep
          utterance.pitch = 0.9; // Lower/Warmer
          
          utterance.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
          setIsSpeaking(true);
      }
  };

  // Cleanup on unmount
  React.useEffect(() => {
      return () => {
          window.speechSynthesis.cancel();
      }
  }, []);

  return (
    <div className="h-full bg-slate-950 flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      {/* Night Sky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-black z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none z-0"></div>
      
      {/* Stars */}
      <div className="absolute top-10 right-20 text-yellow-100 animate-pulse" style={{animationDuration: '3s'}}><Stars size={12} /></div>
      <div className="absolute top-40 left-10 text-yellow-100 animate-pulse" style={{animationDuration: '4s'}}><Stars size={16} /></div>
      <div className="absolute bottom-20 right-10 text-blue-200 animate-pulse" style={{animationDuration: '5s'}}><Stars size={14} /></div>

      {/* Header */}
      <header className="px-4 py-4 z-10 flex items-center gap-3 border-b border-white/10 bg-black/20 backdrop-blur-md">
         <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
             {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-100">
             <Moon size={20} className="text-indigo-300" /> {t.sleepSanctuary}
         </h1>
      </header>

      {/* Tabs */}
      <div className="flex p-4 gap-4 relative z-10">
          <button 
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all border ${activeTab === 'calculator' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50' : 'bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10'}`}
          >
              <Clock size={18} />
              <span className="font-bold text-sm">{t.sleepCalculator}</span>
          </button>
          <button 
            onClick={() => setActiveTab('story')}
            className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all border ${activeTab === 'story' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50' : 'bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10'}`}
          >
              <BookOpen size={18} />
              <span className="font-bold text-sm">{t.bedtimeStory}</span>
          </button>
      </div>

      <main className="flex-1 overflow-y-auto p-6 relative z-10 no-scrollbar">
          
          {/* CALCULATOR TAB */}
          {activeTab === 'calculator' && (
              <div className="animate-slideUp space-y-8">
                  <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center">
                      <h2 className="text-indigo-200 mb-6 font-medium">{t.wakeUpTime}</h2>
                      <div className="relative inline-block">
                          <input 
                              type="time" 
                              value={wakeTime}
                              onChange={(e) => setWakeTime(e.target.value)}
                              className="bg-transparent text-5xl font-bold text-white text-center w-full outline-none border-b-2 border-indigo-500 pb-2 focus:border-indigo-300 transition-colors"
                          />
                      </div>
                      <button 
                          onClick={calculateSleep}
                          className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95"
                      >
                          {t.calculateBedtime}
                      </button>
                  </div>

                  {bedtimes.length > 0 && (
                      <div className="space-y-4 animate-fadeIn">
                          <p className="text-center text-xs text-indigo-300 opacity-80">{t.cyclesDesc}</p>
                          <div className="grid grid-cols-1 gap-4">
                              {bedtimes.map((time, i) => (
                                  <div key={i} className="bg-gradient-to-r from-indigo-900/50 to-slate-900/50 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">
                                              {6 - i}x
                                          </div>
                                          <span className="text-sm text-indigo-200">{language === 'ar' ? 'دورات نوم' : 'Cycles'}</span>
                                      </div>
                                      <span className="text-2xl font-bold text-white tracking-wider">{time}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* STORY TAB */}
          {activeTab === 'story' && (
              <div className="animate-slideUp flex flex-col h-full">
                   {!storyText && !isGeneratingStory ? (
                       <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                           <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                               <Moon size={40} className="text-purple-300" />
                           </div>
                           <div className="w-full max-w-sm space-y-4">
                               <label className="text-sm text-indigo-300 block ml-2">{t.storyTopic}</label>
                               <input 
                                  type="text" 
                                  value={storyTopic}
                                  onChange={(e) => setStoryTopic(e.target.value)}
                                  placeholder={t.storyTopicPlaceholder}
                                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                               />
                               <button 
                                  onClick={generateStory}
                                  disabled={!storyTopic.trim()}
                                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
                               >
                                   {t.generateStory}
                               </button>
                           </div>
                       </div>
                   ) : (
                       <div className="flex-1 flex flex-col min-h-0">
                           <div className="flex-1 bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 overflow-y-auto leading-loose text-lg text-indigo-100 shadow-inner relative mb-4">
                               {isGeneratingStory && !storyText && (
                                   <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-purple-300">
                                       <Stars size={32} className="animate-spin" />
                                       <span className="text-sm animate-pulse">{t.listeningStory}</span>
                                   </div>
                               )}
                               <p className="whitespace-pre-wrap font-serif opacity-90">{storyText}</p>
                           </div>

                           <div className="flex gap-2">
                               <button 
                                  onClick={toggleSpeech}
                                  disabled={!storyText || isGeneratingStory}
                                  className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${isSpeaking ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                               >
                                   {isSpeaking ? <StopCircle size={20} className="animate-pulse" /> : <Play size={20} />}
                                   <span>{isSpeaking ? (language === 'ar' ? 'إيقاف القراءة' : 'Stop Reading') : (language === 'ar' ? 'قراءة القصة' : 'Read Story')}</span>
                               </button>
                               <button 
                                  onClick={() => { setStoryText(''); setStoryTopic(''); }}
                                  className="px-6 py-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors"
                               >
                                   <X size={20} />
                               </button>
                           </div>
                       </div>
                   )}
              </div>
          )}
      </main>
    </div>
  );
};

export default SleepSanctuary;