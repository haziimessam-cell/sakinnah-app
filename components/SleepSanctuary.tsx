
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { GRANDMA_STORY_PROMPT_AR, GRANDMA_STORY_PROMPT_EN, STORY_ELEMENTS_AR, STORY_ELEMENTS_EN, SLEEP_MUSIC_TRACKS, MUSIC_CONDUCTOR_PROMPT_AR, MUSIC_CONDUCTOR_PROMPT_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat, generateSpeech, generateContent } from '../services/geminiService';
// Added Stars to the lucide-react import
import { ArrowRight, ArrowLeft, Moon, Play, Pause, X, User, Loader2, Sparkles, Volume2, ShieldCheck, Heart, Wind, RefreshCw, Zap, Music, Waves, CloudRain, Star, Stars, BookOpen, Clock } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
}

const SleepSanctuary: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [activeView, setActiveView] = useState<'menu' | 'stories' | 'music'>('menu');
  const [storyTitle, setStoryTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [audioVisualizerBars, setAudioVisualizerBars] = useState<number[]>(new Array(24).fill(10));
  
  // Music State
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const [musicDescription, setMusicDescription] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Audio Queuing Logic
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const stopAll = useCallback(() => {
    if (currentAudioSourceRef.current) {
        try { currentAudioSourceRef.current.stop(); } catch(e){}
        currentAudioSourceRef.current = null;
    }
    if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsSpeaking(false);
    setIsGenerating(false);
    setIsMusicPlaying(false);
    setPreloadingProgress(0);
  }, []);

  const playQueue = useCallback(async () => {
      if (audioQueueRef.current.length === 0) {
          isPlayingRef.current = false;
          setIsSpeaking(false);
          return;
      }

      isPlayingRef.current = true;
      setIsSpeaking(true);
      const buffer = audioQueueRef.current.shift()!;
      
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);
      currentAudioSourceRef.current = source;
      
      source.onended = () => {
          playQueue();
      };
      
      source.start();
  }, []);

  const handleGrandmaStory = async () => {
      stopAll();
      setIsGenerating(true);
      setLoadingStep(1);
      setPreloadingProgress(10);
      
      const elements = language === 'ar' ? STORY_ELEMENTS_AR : STORY_ELEMENTS_EN;
      const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      const hero = getRandom(elements.heroes);
      setStoryTitle(language === 'ar' ? `حكاية ${hero.split(' ')[0]}` : `The Tale of ${hero.split(' ')[0]}`);

      try {
          // STEP 1: GENERATE FULL STORY TEXT FIRST
          setLoadingStep(1); // Writing phase
          const richPrompt = (language === 'ar' ? GRANDMA_STORY_PROMPT_AR : GRANDMA_STORY_PROMPT_EN)
              .replace('[HERO]', hero)
              .replace('[SETTING]', getRandom(elements.settings))
              .replace('[THEME]', getRandom(elements.themes))
              .replace('[OBJECT]', getRandom(elements.objects));

          await initializeChat("Grandma Storyteller", richPrompt, undefined, language);
          
          let fullText = "";
          const stream = sendMessageStreamToGemini(language === 'ar' ? "ابدأ الحكاية المعقدة الآن." : "Start the complex tale now.", language);
          
          for await (const chunk of stream) {
              fullText += chunk;
              // Simulate text growth progress up to 40%
              setPreloadingProgress(prev => Math.min(40, prev + 0.5));
          }

          // STEP 2: SPLIT AND GENERATE SPEECH (Pre-loading ALL segments)
          setLoadingStep(2); // Narrating phase
          setPreloadingProgress(50);
          
          // Split by paragraphs or large chunks for high-quality TTS
          const chunks = fullText.split('\n\n').filter(c => c.trim().length > 0);
          const totalChunks = chunks.length;

          for (let i = 0; i < totalChunks; i++) {
              const speechResult = await generateSpeech(chunks[i], 'kore');
              if (speechResult) {
                  audioQueueRef.current.push(speechResult.audioBuffer);
              }
              // Progress from 50% to 100% based on chunks
              setPreloadingProgress(50 + Math.floor(((i + 1) / totalChunks) * 50));
          }

          setLoadingStep(3); // Ready phase
          setTimeout(() => {
              setIsGenerating(false);
              playQueue();
          }, 1000);

      } catch (e) {
          console.error("Story gen failed", e);
          stopAll();
          alert(isRTL ? "تيتا متعبة قليلاً، لنحاول لاحقاً." : "Grandma is a bit tired, let's try later.");
      }
  };

  const startNeuralMusic = async (track: any) => {
      stopAll();
      setSelectedMusic(track);
      setIsGenerating(true);
      setMusicDescription('');

      try {
          const conductorPrompt = language === 'ar' ? MUSIC_CONDUCTOR_PROMPT_AR : MUSIC_CONDUCTOR_PROMPT_EN;
          const userTheme = language === 'ar' ? track.titleAr : track.titleEn;
          
          const descResult = await generateContent(`${conductorPrompt}\nMusic Theme: ${userTheme}`, "You are the world's most peaceful serenity maestro.");
          if (descResult) setMusicDescription(descResult);

          const audio = new Audio(track.url);
          audio.loop = true;
          audio.volume = 0; 
          musicAudioRef.current = audio;
          
          setIsGenerating(false);
          setIsMusicPlaying(true);
          audio.play();

          let vol = 0;
          const fadeInterval = setInterval(() => {
              vol += 0.05;
              if (vol >= 0.7) clearInterval(fadeInterval);
              if (musicAudioRef.current) musicAudioRef.current.volume = Math.min(vol, 0.7);
          }, 200);

      } catch (e) {
          setIsGenerating(false);
          alert("The Orchestra is tuning.");
      }
  };

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isSpeaking || isMusicPlaying) {
          interval = setInterval(() => {
              setAudioVisualizerBars(prev => prev.map(() => Math.random() * (isMusicPlaying ? 80 : 50) + 10));
          }, 80);
      } else {
          setAudioVisualizerBars(new Array(24).fill(5));
      }
      return () => clearInterval(interval);
  }, [isSpeaking, isMusicPlaying]);

  const renderLoadingScreen = () => {
      const steps = [
          { icon: <Zap />, text: isRTL ? 'تجهيز الخيال...' : 'Igniting Imagination...' },
          { icon: <BookOpen />, text: isRTL ? 'تيتا تنسج الأحداث المعقدة...' : 'Grandma is weaving complex plots...' },
          { icon: <Volume2 />, text: isRTL ? 'تحضير النبرات الدافئة...' : 'Preparing warm tones...' },
          { icon: <ShieldCheck />, text: isRTL ? 'ملاذك جاهز تماماً' : 'Sanctuary is fully ready' }
      ];
      const current = steps[loadingStep] || steps[0];

      return (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 animate-fadeIn p-8">
               <div className="relative w-48 h-48 flex items-center justify-center">
                   <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
                   <div className="absolute inset-0 border-t-4 border-indigo-400 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                   <div className="relative z-10 w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                       <Sparkles size={40} className="text-indigo-300 animate-pulse" />
                   </div>
               </div>

               <div className="space-y-4 max-w-xs">
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{isRTL ? 'بناء عالم الأحلام' : 'BUILDING DREAM WORLD'}</h2>
                   <div className="h-12 flex flex-col items-center justify-center">
                       <p className="text-indigo-300 text-lg font-bold animate-fadeIn">{current.text}</p>
                       <p className="text-[10px] text-indigo-400/50 font-black uppercase tracking-widest mt-1">
                           {isRTL ? 'جاري التحميل المسبق الكامل' : 'FULL ATOMIC PRE-LOADING'}
                       </p>
                   </div>
               </div>
               
               <div className="w-full max-w-sm">
                   <div className="flex justify-between text-[10px] font-black text-indigo-400/60 uppercase mb-2 px-1">
                       <span>{isRTL ? 'التقدم' : 'Progress'}</span>
                       <span>{preloadingProgress}%</span>
                   </div>
                   <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                       <div 
                         className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                         style={{ width: `${preloadingProgress}%` }}
                       ></div>
                   </div>
               </div>

               <button onClick={stopAll} className="px-8 py-3 bg-white/5 text-xs font-black rounded-full border border-white/10 text-white/40 hover:text-white transition-all uppercase tracking-widest">
                   {t.stop}
               </button>
          </div>
      );
  };

  return (
    <div className="h-full bg-[#010108] flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#08081a] via-[#010108] to-black z-0"></div>
      
      <header className="px-4 py-4 z-20 flex items-center gap-3 border-b border-white/5 bg-black/40 backdrop-blur-xl">
         <button onClick={() => { if (activeView !== 'menu') { stopAll(); setActiveView('menu'); } else onBack(); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
             {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-100">
             <Moon size={20} className="text-indigo-400" /> {t.sleepSanctuary}
         </h1>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 no-scrollbar flex flex-col">
          {isGenerating ? renderLoadingScreen() : (
              <>
                {activeView === 'menu' && (
                    <div className="space-y-6 animate-slideUp p-6 py-10">
                        <button onClick={() => setActiveView('stories')} className="w-full bg-gradient-to-br from-indigo-950/40 to-purple-950/40 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-center text-center gap-6 shadow-2xl group active:scale-95 transition-all">
                            <div className="w-28 h-28 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-200 shadow-xl border-4 border-indigo-500/5 group-hover:rotate-12 transition-transform duration-700">
                                <User size={56} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{t.grandmaTales}</h3>
                                <p className="text-sm text-indigo-400 font-bold opacity-60 uppercase tracking-widest">{isRTL ? 'سرد معقد ومشوق' : 'Complex Suspenseful Tales'}</p>
                            </div>
                        </button>

                        <button onClick={() => setActiveView('music')} className="w-full bg-gradient-to-br from-blue-950/40 to-teal-950/40 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-center text-center gap-6 shadow-2xl group active:scale-95 transition-all">
                            <div className="w-28 h-28 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-200 shadow-xl border-4 border-blue-500/5 group-hover:-rotate-12 transition-transform duration-700">
                                <Waves size={56} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{isRTL ? 'سيمفونية السكينة' : 'Symphony of Serenity'}</h3>
                                <p className="text-sm text-blue-400 font-bold opacity-60 uppercase tracking-widest">{isRTL ? 'ترددات نوم عالمية' : 'World-Class Frequencies'}</p>
                            </div>
                        </button>
                    </div>
                )}

                {activeView === 'stories' && (
                    <div className="animate-slideUp flex flex-col h-full p-6">
                        {storyTitle === '' ? (
                             <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
                                <div className="w-32 h-32 bg-indigo-500/5 rounded-full flex items-center justify-center border border-indigo-500/10 animate-pulse">
                                    <Stars size={60} className="text-indigo-400" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-white">{isRTL ? 'رحلة في خيال تيتا' : 'A Journey in Grandma\'s Mind'}</h2>
                                    <p className="text-indigo-300/60 text-sm max-w-xs">{isRTL ? 'قصص معقدة مصممة خصيصاً لتشغل عقلك بالجمال حتى تغفو.' : 'Complex tales tailored to occupy your mind with beauty until you sleep.'}</p>
                                </div>
                                <button onClick={handleGrandmaStory} className="w-full max-w-sm py-5 bg-gradient-to-r from-indigo-600 to-purple-800 text-white rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all border border-indigo-500/20">
                                    <Play size={24} fill="currentColor" />
                                    <span>{t.tellMeStory}</span>
                                </button>
                             </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
                                <div className="relative">
                                    <div className={`absolute inset-[-60px] bg-indigo-600/10 rounded-full blur-[80px] transition-all duration-[3s] ${isSpeaking ? 'scale-150 opacity-60' : 'scale-100 opacity-10'}`}></div>
                                    <div className={`w-64 h-64 rounded-full bg-gradient-to-br from-indigo-950 to-black flex items-center justify-center border border-white/10 shadow-2xl relative z-10 transition-transform duration-[5s] ${isSpeaking ? 'scale-105' : 'scale-100'}`}>
                                        <Volume2 size={100} className={`text-indigo-100 transition-all duration-1000 ${isSpeaking ? 'drop-shadow-[0_0_40px_rgba(129,140,248,0.8)]' : 'opacity-20'}`} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black text-white drop-shadow-2xl relative z-10 px-4">{storyTitle}</h3>
                                    <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                                        <Clock size={12} /> {isRTL ? 'حكاية طويلة غامرة' : 'Long Immersive Tale'}
                                    </div>
                                </div>
                                <div className="flex items-end gap-2 h-24 px-10">
                                    {audioVisualizerBars.map((h, i) => (
                                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`} style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                                <button onClick={stopAll} className="px-10 py-4 bg-white/5 hover:bg-white/10 rounded-full flex items-center gap-3 text-xs font-black transition-all border border-white/10 uppercase tracking-widest">
                                    <X size={18} /> {t.stop}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'music' && (
                    <div className="animate-slideUp flex flex-col h-full p-6">
                        {!selectedMusic ? (
                             <div className="grid grid-cols-1 gap-4">
                                <h2 className="text-2xl font-black mb-6 text-blue-100 px-2">{isRTL ? 'اختر ترددات السكينة' : 'Choose Your Frequencies'}</h2>
                                {SLEEP_MUSIC_TRACKS.map((track) => (
                                    <button 
                                        key={track.id} 
                                        onClick={() => startNeuralMusic(track)}
                                        className="w-full bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-center justify-between hover:bg-white/10 transition-all group overflow-hidden relative"
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-14 h-14 bg-${track.color}/10 rounded-2xl flex items-center justify-center text-${track.color} group-hover:scale-110 transition-transform`}>
                                                <Waves size={28} />
                                            </div>
                                            <div className="text-start">
                                                <h4 className="font-black text-lg">{isRTL ? track.titleAr : track.titleEn}</h4>
                                                <p className="text-[10px] text-blue-300 opacity-60 uppercase font-bold tracking-widest">{isRTL ? 'توليد ذكي' : 'Smart Generation'}</p>
                                            </div>
                                        </div>
                                        <Play size={20} className="relative z-10" fill="currentColor" />
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${track.color}/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700`}></div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 py-10">
                                <div className="relative">
                                    <div className={`w-72 h-72 rounded-full border-2 border-white/5 flex items-center justify-center shadow-[0_0_100px_rgba(255,255,255,0.03)] bg-black/40 backdrop-blur-3xl relative z-10 transition-all duration-[10s] ${isMusicPlaying ? 'rotate-[360deg]' : 'rotate-0'}`}>
                                        <Music size={100} className="text-white/10 animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-4 px-6 relative z-10">
                                    <h3 className="text-4xl font-black text-white tracking-tighter">{isRTL ? selectedMusic.titleAr : selectedMusic.titleEn}</h3>
                                    <p className="text-blue-100/70 text-sm italic font-medium max-w-sm mx-auto leading-relaxed animate-fadeIn">
                                        {musicDescription || (isRTL ? 'جاري تهيئة الأجواء العصبية للنوم...' : 'Optimizing neural atmosphere for sleep...')}
                                    </p>
                                </div>
                                <div className="flex items-end gap-1.5 h-16 px-10 w-full max-w-xs">
                                    {audioVisualizerBars.map((h, i) => (
                                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${isMusicPlaying ? 'bg-blue-400/40 shadow-[0_0_10px_rgba(96,165,250,0.2)]' : 'bg-white/5'}`} style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                                <button onClick={() => { stopAll(); setSelectedMusic(null); }} className="px-10 py-4 bg-white/5 hover:bg-white/10 rounded-full flex items-center gap-3 text-xs font-black transition-all border border-white/10 uppercase tracking-widest active:scale-95">
                                    <X size={18} /> {isRTL ? 'إيقاف التجربة' : 'End Journey'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
              </>
          )}
      </main>
    </div>
  );
};

export default SleepSanctuary;
