
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { GRANDMA_STORY_PROMPT_AR, GRANDMA_STORY_PROMPT_EN, STORY_ELEMENTS_AR, STORY_ELEMENTS_EN, SLEEP_MUSIC_TRACKS, MUSIC_CONDUCTOR_PROMPT_AR, MUSIC_CONDUCTOR_PROMPT_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat, generateSpeech, generateContent } from '../services/geminiService';
import { ArrowRight, ArrowLeft, Moon, Play, Pause, X, User, Loader2, Sparkles, Volume2, ShieldCheck, Heart, Wind, RefreshCw, Zap, Music, Waves, CloudRain, Star } from 'lucide-react';

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
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [storyEnded, setStoryEnded] = useState(false);
  const [audioVisualizerBars, setAudioVisualizerBars] = useState<number[]>(new Array(24).fill(10));
  
  // Poetic Loading State
  const [loadingStep, setLoadingStep] = useState(0);

  // Music State
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const [musicDescription, setMusicDescription] = useState('');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Refs
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ritualTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAll = useCallback(() => {
    if (currentAudioSourceRef.current) {
        try { currentAudioSourceRef.current.stop(); } catch(e){}
        currentAudioSourceRef.current = null;
    }
    if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
    }
    nextStartTimeRef.current = 0;
    setIsSpeaking(false);
    setIsGenerating(false);
    setIsRitualActive(false);
    setStoryEnded(false);
    setIsMusicPlaying(false);
    if (ritualTimerRef.current) clearTimeout(ritualTimerRef.current);
  }, []);

  const playScheduledBuffer = useCallback((buffer: AudioBuffer, isLast: boolean = false) => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioCtxRef.current;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;
      currentAudioSourceRef.current = source;
      setIsSpeaking(true);
      source.onended = () => {
          if (ctx.currentTime >= nextStartTimeRef.current - 0.3) {
              setIsSpeaking(false);
              if (isLast) setStoryEnded(true);
          }
      };
  }, []);

  const handleGrandmaStory = async () => {
      stopAll();
      setIsGenerating(true);
      setLoadingStep(0);
      
      const elements = language === 'ar' ? STORY_ELEMENTS_AR : STORY_ELEMENTS_EN;
      const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      const hero = getRandom(elements.heroes);
      
      setStoryTitle(language === 'ar' ? `حكاية ${hero.split(' ')[0]}` : `The Tale of ${hero.split(' ')[0]}`);

      // Cycle through loading steps
      const stepInterval = setInterval(() => {
          setLoadingStep(prev => (prev + 1) % 4);
      }, 3500);

      try {
          const richPrompt = (language === 'ar' ? GRANDMA_STORY_PROMPT_AR : GRANDMA_STORY_PROMPT_EN)
              .replace('[HERO]', hero)
              .replace('[SETTING]', getRandom(elements.settings))
              .replace('[THEME]', getRandom(elements.themes))
              .replace('[OBJECT]', getRandom(elements.objects));

          await initializeChat("Grandma Storyteller", richPrompt, undefined, language);
          let fullText = "";
          const stream = sendMessageStreamToGemini(language === 'ar' ? "ابدأ الحكاية الآن بتشويق." : "Start the story now with suspense.", language);
          for await (const chunk of stream) fullText += chunk;
          
          const chunks = [fullText.slice(0, 1000)]; 
          
          clearInterval(stepInterval);
          setIsGenerating(false);
          setIsRitualActive(true);
          
          const firstChunkResult = await generateSpeech(chunks[0], 'kore');
          ritualTimerRef.current = setTimeout(() => {
              setIsRitualActive(false);
              if (firstChunkResult) playScheduledBuffer(firstChunkResult.audioBuffer, true);
          }, 8000);
      } catch (e) {
          clearInterval(stepInterval);
          stopAll();
          alert("Error in sanctuary.");
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

  const renderNebula = () => {
    const colorMap: Record<string, string> = {
        'indigo-500': 'rgba(99, 102, 241, 0.15)',
        'purple-500': 'rgba(168, 85, 247, 0.15)',
        'emerald-500': 'rgba(16, 185, 129, 0.15)',
        'blue-500': 'rgba(59, 130, 246, 0.15)'
    };
    const activeColor = colorMap[selectedMusic?.color] || 'rgba(99, 102, 241, 0.15)';

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] rounded-full blur-[140px] animate-breathing opacity-80 transition-all duration-[4s]"
            style={{ backgroundColor: activeColor }}
          ></div>
          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-white/40 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/2 right-10 w-2 h-2 bg-indigo-200/20 rounded-full animate-float"></div>
      </div>
    );
  };

  return (
    <div className="h-full bg-[#010108] flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#08081a] via-[#010108] to-black z-0"></div>
      
      {isMusicPlaying && renderNebula()}

      <header className="px-4 py-4 z-20 flex items-center gap-3 border-b border-white/5 bg-black/40 backdrop-blur-xl">
         <button onClick={() => { if (activeView !== 'menu') { stopAll(); setActiveView('menu'); } else onBack(); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
             {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-100">
             <Moon size={20} className="text-indigo-400" /> {t.sleepSanctuary}
         </h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 relative z-10 no-scrollbar">
          {activeView === 'menu' && (
              <div className="space-y-6 animate-slideUp py-10">
                  <button onClick={() => setActiveView('stories')} className="w-full bg-gradient-to-br from-indigo-950/40 to-purple-950/40 backdrop-blur-2xl p-10 rounded-[3.5rem] border border-white/5 flex flex-col items-center justify-center text-center gap-6 shadow-2xl group active:scale-95 transition-all">
                      <div className="w-28 h-28 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-200 shadow-xl border-4 border-indigo-500/5 group-hover:rotate-12 transition-transform duration-700">
                          <User size={56} />
                      </div>
                      <div>
                          <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">{t.grandmaTales}</h3>
                          <p className="text-sm text-indigo-400 font-bold opacity-60 uppercase tracking-widest">{isRTL ? 'مغامرات مشوقة' : 'Thrilling Adventures'}</p>
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
              <div className="animate-slideUp flex flex-col h-full">
                   {isGenerating ? (
                       <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 animate-fadeIn p-6">
                           <div className="relative w-48 h-48 flex items-center justify-center">
                               {/* Cosmic Weaving Animation */}
                               <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-spin-slow"></div>
                               <div className="absolute inset-4 border border-purple-500/20 rounded-full animate-reverse-spin"></div>
                               <div className="relative z-10 w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                                   <Sparkles size={40} className="text-indigo-300 animate-pulse" />
                               </div>
                               
                               {/* Floating bits */}
                               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-ping"></div>
                               <div className="absolute bottom-10 right-0 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                           </div>

                           <div className="space-y-4 max-w-xs mx-auto">
                               <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t.weavingStory}</h2>
                               <div className="h-20 flex items-center justify-center">
                                   <p key={loadingStep} className="text-indigo-200/70 text-sm font-medium italic leading-relaxed animate-fadeIn">
                                       {t[`loadingStep${loadingStep + 1}`]}
                                   </p>
                               </div>
                           </div>
                           
                           <div className="w-full max-w-xs bg-white/5 rounded-full h-1.5 overflow-hidden">
                               <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-loading-progress"></div>
                           </div>

                           <button onClick={stopAll} className="px-6 py-2 bg-white/5 text-xs font-bold rounded-full border border-white/10 text-white/40 hover:text-white transition-all">
                               {t.stop}
                           </button>
                       </div>
                   ) : storyTitle === '' ? (
                       <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
                           <div className="w-32 h-32 bg-indigo-500/5 rounded-full flex items-center justify-center border border-indigo-500/10 animate-pulse">
                               <Zap size={60} className="text-indigo-400" />
                           </div>
                           <h2 className="text-3xl font-black text-white">{isRTL ? 'حكاية تملأ قلبك سكينة' : 'A Tale for Your Soul'}</h2>
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
                                    <Sparkles size={100} className={`text-indigo-100 transition-all duration-1000 ${isSpeaking ? 'drop-shadow-[0_0_40px_rgba(129,140,248,0.8)]' : 'opacity-20'}`} />
                                </div>
                            </div>
                            <h3 className="text-4xl font-black text-white drop-shadow-2xl relative z-10 px-4">{storyTitle}</h3>
                            <div className="flex items-end gap-2 h-20 px-10">
                                {audioVisualizerBars.map((h, i) => (
                                    <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`} style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-4 w-full items-center">
                                {storyEnded && (
                                    <button onClick={handleGrandmaStory} className="w-full max-w-xs py-4 bg-white text-indigo-900 rounded-2xl font-black text-lg shadow-2xl flex items-center justify-center gap-3 animate-slideUp active:scale-95 transition-all">
                                        <RefreshCw size={24} />
                                        <span>{isRTL ? 'حكاية أخرى' : 'Another Tale'}</span>
                                    </button>
                                )}
                                <button onClick={stopAll} className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-full flex items-center gap-2 text-sm font-bold transition-all border border-white/10">
                                    <X size={18} /> {t.stop}
                                </button>
                            </div>
                       </div>
                   )}
              </div>
          )}

          {activeView === 'music' && (
              <div className="animate-slideUp flex flex-col h-full">
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
                                          {track.type === 'deep' ? <Waves /> : track.type === 'ethereal' ? <Star /> : track.type === 'nature' ? <Wind /> : <CloudRain />}
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
                                  {isGenerating ? (
                                      <div className="flex flex-col items-center gap-4 text-blue-400">
                                          <Loader2 size={48} className="animate-spin" />
                                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{isRTL ? 'المايسترو يستعد..' : 'Maestro Tuning..'}</span>
                                      </div>
                                  ) : (
                                      <Music size={100} className="text-white/10 animate-pulse" />
                                  )}
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
      </main>

      {isRitualActive && (
          <div className="fixed inset-0 z-[100] bg-[#02020a] flex flex-col items-center justify-center animate-fadeIn text-white p-6">
              <div className="relative flex flex-col items-center text-center space-y-12">
                  <div className="w-48 h-48 bg-indigo-500/5 rounded-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-breathing blur-3xl"></div>
                      <Wind size={60} className="text-indigo-300 animate-pulse" />
                  </div>
                  <div className="space-y-4">
                      <h2 className="text-3xl font-black text-indigo-100 uppercase tracking-tighter">{isRTL ? 'استعد للسكينة' : 'Prepare for Serenity'}</h2>
                      <p className="text-indigo-300/60 max-w-xs mx-auto leading-relaxed italic font-medium text-sm">
                          {isRTL ? 'تنفس بهدوء مع الضوء.. تيتا تنسج لك عالماً من الأحلام..' : 'Breathe with the light.. Grandma is weaving a world of dreams..'}
                      </p>
                  </div>
              </div>
          </div>
      )}

      <style>{`
          @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
          }
          @keyframes reverse-spin {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
          }
          @keyframes loading-progress {
              0% { width: 0%; transform: translateX(-100%); }
              50% { width: 70%; transform: translateX(0%); }
              100% { width: 100%; transform: translateX(100%); }
          }
          .animate-spin-slow { animation: spin-slow 15s linear infinite; }
          .animate-reverse-spin { animation: reverse-spin 10s linear infinite; }
          .animate-loading-progress { 
              animation: loading-progress 4s ease-in-out infinite;
              background-size: 200% 100%;
          }
      `}</style>
    </div>
  );
};

export default SleepSanctuary;
