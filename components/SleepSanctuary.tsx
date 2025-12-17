
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { GRANDMA_STORY_PROMPT_AR, GRANDMA_STORY_PROMPT_EN, STORY_ELEMENTS_AR, STORY_ELEMENTS_EN, SLEEP_MUSIC_TRACKS } from '../constants';
import { sendMessageStreamToGemini, initializeChat, generateSpeech } from '../services/geminiService';
import { ArrowRight, ArrowLeft, Moon, Stars, Clock, Music, Play, Pause, X, Headphones, User, Cloud, Sparkles } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
}

const LOADING_MESSAGES_AR = [
    "جاري نسج خيوط الخيال...",
    "تيتا سكينة تبحث في كتاب الحكايات...",
    "نجمع النجوم لنضيء القصة...",
    "نستحضر الهدوء والسكينة...",
    "تحضير كوب حليب دافئ للروح...",
    "القصة تقترب..."
];

const LOADING_MESSAGES_EN = [
    "Weaving threads of imagination...",
    "Grandma is opening the storybook...",
    "Gathering stars to light the tale...",
    "Summoning calm and serenity...",
    "Preparing warm milk for the soul...",
    "The story is approaching..."
];

const SleepSanctuary: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [activeView, setActiveView] = useState<'menu' | 'calculator' | 'stories' | 'music'>('menu');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [bedtimes, setBedtimes] = useState<string[]>([]);
  
  const [storyText, setStoryText] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [audioVisualizerBars, setAudioVisualizerBars] = useState<number[]>(new Array(20).fill(10));
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Music State
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);

  const stopReading = useCallback(() => {
    if (currentAudioSourceRef.current) {
        currentAudioSourceRef.current.stop();
        currentAudioSourceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const startReading = useCallback(async (textToRead: string) => {
    stopReading();
    setIsSpeaking(true);
    
    // Using Aoife for a warm grandmotherly voice
    const speechResult = await generateSpeech(textToRead, 'Aoife');
    
    if (speechResult) {
        const { audioBuffer, audioCtx } = speechResult;
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        currentAudioSourceRef.current = source;
        
        source.onended = () => {
            setIsSpeaking(false);
        };
        
        source.start();
    } else {
        setIsSpeaking(false);
    }
  }, [stopReading]);

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isSpeaking) {
          interval = setInterval(() => {
              setAudioVisualizerBars(prev => prev.map(() => Math.random() * 40 + 10));
          }, 100);
      } else {
          setAudioVisualizerBars(new Array(20).fill(5));
      }
      return () => clearInterval(interval);
  }, [isSpeaking]);

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isGeneratingStory) {
          const msgs = language === 'ar' ? LOADING_MESSAGES_AR : LOADING_MESSAGES_EN;
          interval = setInterval(() => {
              setLoadingMsgIndex(prev => (prev + 1) % msgs.length);
          }, 3500);
      }
      return () => clearInterval(interval);
  }, [isGeneratingStory, language]);

  const calculateSleep = () => {
      const [hours, mins] = wakeTime.split(':').map(Number);
      const wakeDate = new Date();
      wakeDate.setHours(hours, mins, 0);
      const cycles = [6, 5, 4];
      const times = cycles.map(c => {
          const sleepDate = new Date(wakeDate.getTime() - (c * 90 * 60000));
          return sleepDate.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' });
      });
      setBedtimes(times);
  };

  const handleGrandmaStory = async () => {
      setIsGeneratingStory(true);
      setStoryText('');
      stopReading();
      setLoadingMsgIndex(0);
      
      const elements = language === 'ar' ? STORY_ELEMENTS_AR : STORY_ELEMENTS_EN;
      const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      
      const hero = getRandom(elements.heroes);
      const setting = getRandom(elements.settings);
      const theme = getRandom(elements.themes);
      const object = getRandom(elements.objects);
      
      setStoryTitle(language === 'ar' ? `حكاية ${hero.split(' ')[0]}` : `The Tale of ${hero.split(' ')[0]}`);

      const promptTemplate = language === 'ar' ? GRANDMA_STORY_PROMPT_AR : GRANDMA_STORY_PROMPT_EN;
      const richPrompt = promptTemplate
          .replace('[HERO]', hero)
          .replace('[SETTING]', setting)
          .replace('[THEME]', theme)
          .replace('[OBJECT]', object);

      const userMessage = language === 'ar' 
          ? `احكي لي قصة دافئة عن ${hero} في ${setting}.` 
          : `Tell me a warm story about ${hero} in ${setting}.`;

      let fullText = "";
      try {
          await initializeChat("Grandma Story Session", richPrompt, undefined, language);
          const stream = sendMessageStreamToGemini(userMessage, language);
          for await (const chunk of stream) {
              fullText += chunk;
          }
          setStoryText(fullText);
          if (fullText) {
              setTimeout(() => startReading(fullText), 500);
          }
      } catch (e) {
          setStoryText(t.storyError);
      } finally {
          setIsGeneratingStory(false);
      }
  };

  const toggleSpeech = () => {
      if (isSpeaking) stopReading();
      else if (storyText) startReading(storyText);
  };

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isPlaying && currentTrack) {
          interval = setInterval(() => {
              setTrackProgress(prev => {
                  if (prev >= 100) { setIsPlaying(false); return 0; }
                  return prev + 0.05;
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const renderWaitingScreen = () => {
      const msgs = language === 'ar' ? LOADING_MESSAGES_AR : LOADING_MESSAGES_EN;
      return (
          <div className="absolute inset-0 z-50 bg-[#0B0F19] flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f35] to-[#0B0F19]"></div>
              <div className="relative mb-12">
                  <div className="w-40 h-40 bg-indigo-100 rounded-full shadow-[0_0_100px_rgba(199,210,254,0.3)] animate-pulse flex items-center justify-center relative z-10">
                      <div className="absolute top-6 right-8 w-6 h-6 bg-indigo-200/50 rounded-full blur-sm"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite]">
                      <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"></div>
                  </div>
              </div>
              <div className="relative z-20 text-center px-6 h-16">
                  <p key={loadingMsgIndex} className="text-indigo-200 text-lg font-medium animate-fadeIn leading-relaxed tracking-wide font-serif">
                      {msgs[loadingMsgIndex]}
                  </p>
              </div>
          </div>
      );
  };

  return (
    <div className="h-full bg-slate-950 flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      {isGeneratingStory && renderWaitingScreen()}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-black z-0"></div>
      <header className="px-4 py-4 z-10 flex items-center gap-3 border-b border-white/10 bg-black/20 backdrop-blur-md">
         <button onClick={() => { if (activeView !== 'menu') { stopReading(); setIsPlaying(false); setActiveView('menu'); } else onBack(); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
             {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-100">
             <Moon size={20} className="text-indigo-300" /> {t.sleepSanctuary}
         </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 relative z-10 no-scrollbar">
          {activeView === 'menu' && (
              <div className="space-y-4 animate-slideUp">
                  <button onClick={() => setActiveView('calculator')} className="w-full bg-gradient-to-br from-indigo-900 to-blue-900 p-6 rounded-[2rem] border border-white/10 flex items-center justify-between shadow-lg group hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-indigo-800 rounded-2xl flex items-center justify-center text-indigo-200 shadow-inner"><Clock size={32} /></div>
                          <div className="text-start">
                              <h3 className="text-lg font-bold text-white">{t.sleepCalculator}</h3>
                              <p className="text-xs text-indigo-200 opacity-70">{t.cyclesDesc}</p>
                          </div>
                      </div>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button onClick={() => setActiveView('stories')} className="bg-gradient-to-br from-purple-900 to-fuchsia-900 p-6 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-center gap-4 shadow-lg group hover:scale-[1.02] transition-transform h-64">
                          <div className="w-20 h-20 bg-purple-800 rounded-full flex items-center justify-center text-purple-200 shadow-lg border-4 border-purple-700/50"><User size={40} /></div>
                          <div><h3 className="text-xl font-bold text-white mb-1">{t.grandmaTales}</h3><p className="text-xs text-purple-200 opacity-80">{t.grandmaVoice}</p></div>
                      </button>
                      <button onClick={() => setActiveView('music')} className="bg-gradient-to-br from-teal-900 to-emerald-900 p-6 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-center gap-4 shadow-lg group hover:scale-[1.02] transition-transform h-64">
                          <div className="w-20 h-20 bg-teal-800 rounded-full flex items-center justify-center text-teal-200 shadow-lg border-4 border-teal-700/50"><Headphones size={40} /></div>
                          <div><h3 className="text-xl font-bold text-white mb-1">{t.sleepMusic}</h3><p className="text-xs text-teal-200 opacity-80">{t.musicTracks}</p></div>
                      </button>
                  </div>
              </div>
          )}

          {activeView === 'stories' && (
              <div className="animate-slideUp flex flex-col h-full">
                   {!storyText && !isGeneratingStory ? (
                       <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
                           <div className="w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30 animate-pulse"><Moon size={60} className="text-purple-300" /></div>
                           <div><h2 className="text-2xl font-bold text-white mb-2">{t.grandmaTales}</h2><p className="text-purple-200 max-w-xs mx-auto text-sm">{t.grandmaStoryDesc}</p></div>
                           <button onClick={handleGrandmaStory} className="w-full max-w-sm py-5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-[2rem] font-bold text-lg shadow-xl flex items-center justify-center gap-3"><Play size={24} fill="currentColor" /><span>{t.tellMeStory}</span></button>
                       </div>
                   ) : (
                       <div className="flex-1 flex flex-col min-h-0 relative">
                           <div className="absolute top-0 right-0 p-4 z-20">
                               <button onClick={() => { setStoryText(''); setStoryTitle(''); stopReading(); }} className="px-4 py-2 bg-white/10 rounded-full flex items-center gap-2 text-sm"><X size={16} /> {t.stop}</button>
                           </div>
                           <div className="flex-1 flex flex-col items-center justify-center relative">
                               <div className={`absolute w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] transition-all duration-1000 ${isSpeaking ? 'scale-125 opacity-60' : 'scale-100 opacity-30'}`}></div>
                               <div className="relative z-10 flex flex-col items-center space-y-8">
                                   <div className={`w-48 h-48 rounded-full flex items-center justify-center shadow-lg border-4 border-white/10 bg-gradient-to-br from-indigo-900 to-purple-900 transition-transform duration-[2s] ${isSpeaking ? 'scale-105' : 'scale-100'}`}>
                                       <Moon size={80} className="text-yellow-100" />
                                       <Cloud size={60} className="text-white/20 absolute bottom-8 right-8 animate-float" />
                                   </div>
                                   <div className="text-center space-y-2">
                                       <h3 className="text-2xl font-bold text-white tracking-wide">{storyTitle}</h3>
                                       <p className="text-purple-200 text-sm animate-pulse">{isSpeaking ? (language === 'ar' ? 'تيتا تقرأ لك...' : 'Grandma is reading...') : (language === 'ar' ? 'متوقف مؤقتاً' : 'Paused')}</p>
                                   </div>
                                   <div className="flex items-end gap-1 h-12">
                                       {audioVisualizerBars.map((height, i) => (
                                           <div key={i} className="w-1.5 bg-purple-400 rounded-full transition-all duration-100" style={{ height: `${height}%`, opacity: Math.max(0.3, height/50) }} />
                                       ))}
                                   </div>
                               </div>
                           </div>
                           <div className="pb-10 px-6">
                               <button onClick={toggleSpeech} className={`w-full py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all text-lg shadow-xl ${isSpeaking ? 'bg-white/10 text-white' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'}`}>
                                   {isSpeaking ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                   <span>{isSpeaking ? (language === 'ar' ? 'إيقاف مؤقت' : 'Pause') : (language === 'ar' ? 'متابعة الاستماع' : 'Resume')}</span>
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
