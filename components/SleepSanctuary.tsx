
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { GRANDMA_STORY_PROMPT_AR, GRANDMA_STORY_PROMPT_EN, STORY_ELEMENTS_AR, STORY_ELEMENTS_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat, generateSpeech } from '../services/geminiService';
import { ArrowRight, ArrowLeft, Moon, Play, X, Sparkles, Volume2, Stars, Waves, RefreshCw, AlertCircle, Zap, FastForward, Radio } from 'lucide-react';

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
  const [showNextButton, setShowNextButton] = useState(false);
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioVisualizerBars, setAudioVisualizerBars] = useState<number[]>(new Array(24).fill(10));
  
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isAbortedRef = useRef(false);
  const isGeneratingRef = useRef(false);
  const lastProcessedSentenceIndexRef = useRef(0);

  const stopAll = useCallback(() => {
    isAbortedRef.current = true;
    if (currentAudioSourceRef.current) {
        try { currentAudioSourceRef.current.stop(); } catch(e){}
        currentAudioSourceRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsSpeaking(false);
    setIsGenerating(false);
    isGeneratingRef.current = false;
    setPreloadingProgress(0);
    setShowNextButton(false);
    lastProcessedSentenceIndexRef.current = 0;
  }, []);

  const playQueue = useCallback(async () => {
      if (isAbortedRef.current) return;
      
      if (audioQueueRef.current.length === 0) {
          if (isGeneratingRef.current) {
              setTimeout(playQueue, 200);
          } else {
              isPlayingRef.current = false;
              setIsSpeaking(false);
              setShowNextButton(true);
          }
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
          currentAudioSourceRef.current = null;
          playQueue();
      };
      source.start();
  }, []);

  const handleGrandmaStory = async () => {
      stopAll();
      isAbortedRef.current = false;
      setIsGenerating(true);
      isGeneratingRef.current = true;
      setShowNextButton(false);
      setError(null);
      setPreloadingProgress(5);
      
      const elements = language === 'ar' ? STORY_ELEMENTS_AR : STORY_ELEMENTS_EN;
      const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      const hero = getRandom(elements.heroes);
      setStoryTitle(language === 'ar' ? `مغامرة ${hero.split(' ')[0]}` : `${hero.split(' ')[0]}'s Quest`);

      // 1. مقدمة فورية لكسر حاجز الانتظار
      const instantIntroText = language === 'ar' 
        ? "أغلق عينيك الآن، ودع خيالك يطير. القصة بدأت..." 
        : "Close your eyes now, let your imagination fly. The story begins...";
      
      generateSpeech(instantIntroText).then(res => {
          if (res && !isAbortedRef.current) {
              audioQueueRef.current.push(res.audioBuffer);
              if (!isPlayingRef.current) playQueue();
          }
      });

      try {
          const richPrompt = (language === 'ar' ? GRANDMA_STORY_PROMPT_AR : GRANDMA_STORY_PROMPT_EN)
              .replace('[HERO]', hero)
              .replace('[SETTING]', getRandom(elements.settings))
              .replace('[THEME]', getRandom(elements.themes))
              .replace('[OBJECT]', getRandom(elements.objects));

          await initializeChat("TurboStoryteller", richPrompt, undefined, language);
          
          let fullText = "";
          const voiceForStory = language === 'ar' ? 'Kore' : 'Puck';
          
          const stream = sendMessageStreamToGemini(language === 'ar' ? "ابدأ فوراً بأقوى جملة تشويق." : "Start immediately with the most intense suspenseful sentence.", language);
          
          for await (const chunk of stream) {
              if (isAbortedRef.current) break;
              fullText += chunk;
              
              // 2. تقسيم على مستوى الجملة لسرعة الاستجابة القصوى
              const sentences = fullText.split(/[.?!]\s+|\n+/);
              if (sentences.length > lastProcessedSentenceIndexRef.current + 1) {
                  const currentIdx = lastProcessedSentenceIndexRef.current;
                  const sentenceToProcess = sentences[currentIdx].trim();
                  
                  if (sentenceToProcess.length > 10) { // تجنب الجمل القصيرة جداً
                      generateSpeech(sentenceToProcess, voiceForStory).then(res => {
                          if (res && !isAbortedRef.current) {
                              audioQueueRef.current.push(res.audioBuffer);
                              if (!isPlayingRef.current) playQueue();
                          }
                      });
                      lastProcessedSentenceIndexRef.current++;
                      setPreloadingProgress(prev => Math.min(95, prev + 5));
                  }
              }
          }

          // معالجة آخر جملة متبقية
          const remainingText = fullText.split(/[.?!]\s+|\n+/).slice(lastProcessedSentenceIndexRef.current).join(' ').trim();
          if (remainingText && !isAbortedRef.current) {
              const res = await generateSpeech(remainingText, voiceForStory);
              if (res) audioQueueRef.current.push(res.audioBuffer);
              if (!isPlayingRef.current) playQueue();
          }

          setIsGenerating(false);
          isGeneratingRef.current = false;
          setPreloadingProgress(100);
      } catch (e) {
          console.error("Turbo Story failed", e);
          setIsGenerating(false);
          isGeneratingRef.current = false;
          setError(isRTL ? "تعطل محرك المغامرة، لنحاول ثانية!" : "Adventure engine stalled, let's try again!");
      }
  };

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isSpeaking) {
          interval = setInterval(() => {
              setAudioVisualizerBars(prev => prev.map(() => Math.random() * 60 + 5));
          }, 80);
      } else {
          setAudioVisualizerBars(new Array(24).fill(5));
      }
      return () => clearInterval(interval);
  }, [isSpeaking]);

  return (
    <div className="h-full bg-[#020205] flex flex-col pt-safe pb-safe animate-fadeIn text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b,transparent)] opacity-50 z-0"></div>
      
      <header className="px-6 py-4 z-20 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
         <div className="flex items-center gap-4">
            <button onClick={() => { if (activeView !== 'menu') { stopAll(); setActiveView('menu'); } else onBack(); }} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
                {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </button>
            <h1 className="text-xl font-black flex items-center gap-2 text-indigo-100 font-sans tracking-tight">
                <Radio size={20} className="text-emerald-400 animate-pulse" /> {t.grandmaTales}
            </h1>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 no-scrollbar flex flex-col">
          {isGenerating && preloadingProgress < 10 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn p-8">
                   <div className="relative">
                       <div className="w-40 h-40 border-4 border-emerald-500/20 rounded-full animate-pulse"></div>
                       <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
                       <Sparkles size={48} className="absolute inset-0 m-auto text-emerald-400 animate-pulse" />
                   </div>
                   <div className="space-y-2">
                       <h2 className="text-2xl font-black uppercase italic tracking-tighter">{isRTL ? 'ربط القنوات العصبية...' : 'NEURAL LINKING...'}</h2>
                       <p className="text-emerald-400 text-[10px] font-black animate-pulse tracking-[0.3em]">{isRTL ? 'البدء فوري تقريباً' : 'ALMOST INSTANT START'}</p>
                   </div>
              </div>
          ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 border border-red-500/20">
                      <AlertCircle size={40} />
                  </div>
                  <h3 className="text-xl font-black text-red-200">{error}</h3>
                  <button onClick={handleGrandmaStory} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-lg">
                      <RefreshCw size={20} /> {isRTL ? 'إعادة المحاولة' : 'RETRY'}
                  </button>
              </div>
          ) : (
              <>
                {activeView === 'menu' && (
                    <div className="space-y-6 animate-slideUp p-6 py-10">
                        <button onClick={() => setActiveView('stories')} className="w-full bg-gradient-to-br from-indigo-950/60 to-black p-10 rounded-[3rem] border border-white/10 flex flex-col items-center text-center gap-6 shadow-2xl group active:scale-95 transition-all">
                            <div className="w-28 h-28 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-200 shadow-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                <Stars size={56} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tight font-sans">{t.grandmaTales}</h3>
                                <p className="text-xs text-emerald-400 font-bold opacity-60 uppercase tracking-[0.3em]">{isRTL ? 'مغامرات بطلها أنت' : 'YOU ARE THE HERO'}</p>
                            </div>
                        </button>
                        <button onClick={() => setActiveView('music')} className="w-full bg-gradient-to-br from-blue-950/60 to-black p-10 rounded-[3rem] border border-white/10 flex flex-col items-center text-center gap-6 shadow-2xl group active:scale-95 transition-all">
                            <div className="w-28 h-28 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-200 shadow-xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                                <Waves size={56} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tight font-sans">{isRTL ? 'أصوات الطبيعة' : 'NATURE PULSE'}</h3>
                                <p className="text-xs text-blue-400 font-bold opacity-60 uppercase tracking-[0.3em]">{isRTL ? 'ترددات استرخاء' : 'RELAX FREQUENCIES'}</p>
                            </div>
                        </button>
                    </div>
                )}
                {activeView === 'stories' && (
                    <div className="animate-slideUp flex flex-col h-full p-6">
                        {storyTitle === '' ? (
                             <div className="flex-1 flex flex-col items-center justify-center space-y-10 text-center">
                                <div className="relative">
                                    <Stars size={80} className="text-indigo-400 animate-pulse" />
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
                                </div>
                                <h2 className="text-4xl font-black text-white italic font-sans">{isRTL ? 'جاهز للمغامرة؟' : 'READY FOR QUEST?'}</h2>
                                <button onClick={handleGrandmaStory} className="w-full max-w-sm py-6 bg-emerald-500 text-black rounded-[2.5rem] font-black text-2xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all">
                                    <Play size={28} fill="currentColor" />
                                    <span>{t.tellMeStory}</span>
                                </button>
                             </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10">
                                <div className={`relative w-64 h-64 rounded-full bg-indigo-950/20 flex items-center justify-center border-2 border-white/10 shadow-2xl transition-all duration-500 ${isSpeaking ? 'scale-110' : 'scale-100'}`}>
                                    <div className={`absolute inset-0 bg-emerald-500/10 rounded-full blur-xl animate-pulse ${isSpeaking ? 'opacity-100' : 'opacity-0'}`}></div>
                                    <Volume2 size={100} className={`text-emerald-100 relative z-10 transition-all ${isSpeaking ? 'drop-shadow-[0_0_30px_#10b981]' : 'opacity-20'}`} />
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">{storyTitle}</h3>
                                    {isGenerating && <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">{isRTL ? 'المحرك يعمل بأقصى سرعة...' : 'ENGINE AT FULL THROTTLE...'}</p>}
                                </div>

                                <div className="flex items-end gap-1.5 h-20 px-8">
                                    {audioVisualizerBars.map((h, i) => (
                                        <div key={i} className={`flex-1 rounded-full transition-all duration-150 ${isSpeaking ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-white/5'}`} style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                                    {!showNextButton ? (
                                        <button onClick={stopAll} className="px-12 py-5 bg-red-600/90 hover:bg-red-50 text-white rounded-[2rem] flex items-center justify-center gap-4 text-xs font-black transition-all shadow-xl uppercase tracking-widest">
                                            <X size={20} /> {t.stop}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleGrandmaStory} 
                                            className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-black rounded-[2rem] flex items-center justify-center gap-4 text-lg font-black transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 animate-reveal"
                                        >
                                            <FastForward size={24} fill="currentColor" />
                                            <span>{isRTL ? 'المغامرة التالية' : 'NEXT ADVENTURE'}</span>
                                        </button>
                                    )}
                                </div>
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
