
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { GRANDMA_STORY_PROMPT_AR, GRANDMA_STORY_PROMPT_EN, STORY_ELEMENTS_AR, STORY_ELEMENTS_EN } from '../constants';
import { sendMessageStreamToGemini, initializeChat, generateSpeech } from '../services/geminiService';
import { ArrowRight, ArrowLeft, Moon, Play, Pause, X, Loader2, Sparkles, Volume2, ShieldCheck, BookOpen, Music } from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
}

const LOADING_PHASES_AR = [
    { text: "تيتة تتخيل ملامح الحكاية الجديدة...", icon: <Sparkles size={32} /> },
    { text: "تأليف أحداث مشوقة وممتعة...", icon: <BookOpen size={32} /> },
    { text: "جاري دمج الهدوء والسكينة...", icon: <Moon size={32} /> },
    { text: "تحضير صوت تيتة الدافئ...", icon: <Volume2 size={32} /> },
    { text: "القصة جاهزة تماماً لملاذك...", icon: <ShieldCheck size={32} /> }
];

const LOADING_PHASES_EN = [
    { text: "Grandma is imagining a new tale...", icon: <Sparkles size={32} /> },
    { text: "Weaving exciting and fun events...", icon: <BookOpen size={32} /> },
    { text: "Merging calm and serenity...", icon: <Moon size={32} /> },
    { text: "Preparing Grandma's warm voice...", icon: <Volume2 size={32} /> },
    { text: "The story is fully ready for your sanctuary...", icon: <ShieldCheck size={32} /> }
];

const SleepSanctuary: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [activeView, setActiveView] = useState<'menu' | 'stories' | 'music'>('menu');
  const [storyTitle, setStoryTitle] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [audioVisualizerBars, setAudioVisualizerBars] = useState<number[]>(new Array(20).fill(10));

  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingQueueRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const stopReading = useCallback(() => {
    if (currentAudioSourceRef.current) {
        try { currentAudioSourceRef.current.stop(); } catch(e){}
        currentAudioSourceRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingQueueRef.current = false;
    setIsSpeaking(false);
  }, []);

  const playNextInQueue = useCallback(async () => {
      if (audioQueueRef.current.length === 0) {
          isPlayingQueueRef.current = false;
          setIsSpeaking(false);
          return;
      }

      isPlayingQueueRef.current = true;
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
          playNextInQueue();
      };
      
      source.start();
  }, []);

  const prepareAudio = async (textSegments: string[]) => {
      setLoadingPhase(3); // Start TTS prep
      
      for (const segment of textSegments) {
          try {
              const speechResult = await generateSpeech(segment, 'kore');
              if (speechResult) {
                  audioQueueRef.current.push(speechResult.audioBuffer);
              }
          } catch (err: any) {
              console.error("Audio generation error:", err);
          }
      }
      
      setLoadingPhase(4); // Final phase
      setTimeout(() => {
          setIsGeneratingStory(false);
          playNextInQueue();
      }, 1200);
  };

  const handleGrandmaStory = async () => {
      setIsGeneratingStory(true);
      setLoadingPhase(0);
      stopReading();
      
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
          ? `اروي لي القصة الكاملة والمشوقة الآن دفعة واحدة لتمكني من قراءتها. اجعلها طويلة جداً.` 
          : `Tell me the complete and exciting story now in one go so I can read it. Make it very long.`;

      let fullText = "";
      
      try {
          setLoadingPhase(1); // Generation phase
          await initializeChat("Infinite Sleep Session", richPrompt, undefined, language);
          const stream = sendMessageStreamToGemini(userMessage, language);
          
          for await (const chunk of stream) {
              fullText += chunk;
          }
          
          setLoadingPhase(2); // Analysis and Chunking
          
          const chunks: string[] = [];
          let currentChunk = "";
          const sentences = fullText.split(/[.؟!]+ /);
          
          for (const sentence of sentences) {
              if ((currentChunk.length + sentence.length) < 3000) {
                  currentChunk += sentence + ". ";
              } else {
                  chunks.push(currentChunk);
                  currentChunk = sentence + ". ";
              }
          }
          if (currentChunk) chunks.push(currentChunk);
          
          // Pre-generate all audio
          await prepareAudio(chunks);
          
      } catch (e) {
          setIsGeneratingStory(false);
          alert(isRTL ? "عذراً، حدث خطأ أثناء تحضير السحر." : "Sorry, an error occurred preparing the magic.");
      }
  };

  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isSpeaking) {
          interval = setInterval(() => {
              setAudioVisualizerBars(prev => prev.map(() => Math.random() * 50 + 5));
          }, 80);
      } else {
          setAudioVisualizerBars(new Array(20).fill(2));
      }
      return () => clearInterval(interval);
  }, [isSpeaking]);

  const renderWaitingScreen = () => {
      const phases = language === 'ar' ? LOADING_PHASES_AR : LOADING_PHASES_EN;
      const current = phases[loadingPhase] || phases[0];
      
      return (
          <div className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
              <div className="w-24 h-24 bg-ios-azure/10 rounded-[2.5rem] flex items-center justify-center text-ios-azure mb-8 animate-float">
                  {current.icon}
              </div>
              <h3 className="text-xl font-bold text-black mb-2">{isRTL ? 'تحضير السكينة' : 'Preparing Serenity'}</h3>
              <p key={loadingPhase} className="text-sm text-gray-500 font-medium animate-reveal h-10">
                  {current.text}
              </p>
              
              <div className="mt-12 w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-ios-azure transition-all duration-1000" 
                    style={{ width: `${((loadingPhase + 1) / phases.length) * 100}%` }}
                  ></div>
              </div>
          </div>
      );
  };

  return (
    <div className="h-full bg-white flex flex-col pt-safe pb-safe animate-fadeIn text-black overflow-hidden relative">
      {isGeneratingStory && renderWaitingScreen()}
      
      <header className="px-6 py-6 z-10 flex items-center justify-between border-b border-gray-100">
         <button onClick={() => { if (activeView !== 'menu') { stopReading(); setActiveView('menu'); } else onBack(); }} className="w-10 h-10 bg-ios-slate rounded-full flex items-center justify-center text-ios-azure">
             {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
         </button>
         <h1 className="text-xl font-bold">{t.sleepSanctuary}</h1>
         <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 relative z-10 no-scrollbar">
          {activeView === 'menu' && (
              <div className="space-y-4 animate-slideUp">
                  <button onClick={() => setActiveView('stories')} className="w-full ios-card p-10 flex flex-col items-center text-center gap-6">
                      <div className="w-20 h-20 bg-ios-azure/10 rounded-[1.8rem] flex items-center justify-center text-ios-azure">
                          <BookOpen size={40} />
                      </div>
                      <div>
                          <h3 className="text-2xl font-bold text-black mb-1">{t.grandmaTales}</h3>
                          <p className="text-xs text-gray-400 font-medium px-4">{t.grandmaVoice}</p>
                      </div>
                  </button>
                  
                  <button onClick={() => setActiveView('music')} className="w-full ios-card p-6 flex items-center gap-5">
                      <div className="w-14 h-14 bg-ios-emerald/10 rounded-2xl flex items-center justify-center text-ios-emerald">
                          <Music size={28} />
                      </div>
                      <div className="text-start">
                          <h3 className="text-lg font-bold text-black">{t.sleepMusic}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{isRTL ? 'أنغام هادئة' : 'Calm Melodies'}</p>
                      </div>
                  </button>
              </div>
          )}

          {activeView === 'stories' && (
              <div className="animate-slideUp h-full flex flex-col">
                   {storyTitle === '' && !isGeneratingStory ? (
                       <div className="flex-1 flex flex-col items-center justify-center space-y-8 text-center">
                           <div className="w-24 h-24 bg-ios-azure/10 rounded-full flex items-center justify-center text-ios-azure animate-pulse">
                               <Moon size={48} />
                           </div>
                           <div className="space-y-2">
                               <h2 className="text-2xl font-bold text-black">{t.grandmaTales}</h2>
                               <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed px-4">
                                   {isRTL ? 'استعد لرحلة معقدة ومشوقة في خيال تيتة الواسع لتنام بعمق.' : 'Prepare for a complex and exciting journey in Grandma\'s vast imagination.'}
                               </p>
                           </div>
                           <button onClick={handleGrandmaStory} className="w-full max-w-sm py-4 bg-ios-azure text-white rounded-2xl font-bold text-lg shadow-xl shadow-ios-azure/20 active:scale-95 transition-all">
                               {t.tellMeStory}
                           </button>
                       </div>
                   ) : (
                       <div className="flex-1 flex flex-col relative py-10">
                           <div className="flex-1 flex flex-col items-center justify-center space-y-12">
                               <div className={`w-64 h-64 rounded-[3.5rem] bg-ios-slate flex items-center justify-center shadow-xl transition-transform duration-[4000ms] ${isSpeaking ? 'scale-105' : 'scale-100'}`}>
                                   <Moon size={100} className={`text-ios-azure transition-all duration-1000 ${isSpeaking ? 'opacity-100' : 'opacity-40'}`} />
                               </div>
                               
                               <div className="text-center space-y-3">
                                   <h3 className="text-3xl font-bold text-black tracking-tight">{storyTitle}</h3>
                                   {isSpeaking ? (
                                       <div className="flex items-center justify-center gap-2 text-ios-emerald text-sm font-bold bg-ios-emerald/5 px-4 py-1.5 rounded-full">
                                          <Sparkles size={16} />
                                          <span>{isRTL ? 'تيتة تحكي الآن...' : 'Grandma is telling...'}</span>
                                       </div>
                                   ) : (
                                       <p className="text-gray-400 text-sm">{isRTL ? 'أغمض عينيك وانصت...' : 'Close your eyes and listen...'}</p>
                                   )}
                               </div>

                               {/* Visualizer */}
                               <div className="flex items-end gap-2 h-20">
                                   {audioVisualizerBars.map((height, i) => (
                                       <div key={i} className="w-2 bg-ios-azure/20 rounded-full transition-all duration-300" style={{ height: `${height}%`, backgroundColor: isSpeaking ? '#007AFF' : '#E5E7EB' }} />
                                   ))}
                               </div>
                           </div>

                           <div className="mt-auto px-4 pb-10">
                               <button 
                                  onClick={() => { if(isSpeaking) { stopReading(); } else if(audioQueueRef.current.length > 0) playNextInQueue(); }} 
                                  className="w-full py-5 rounded-2xl bg-black text-white font-bold text-xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl"
                               >
                                   {isSpeaking ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                                   <span>{isSpeaking ? (isRTL ? 'إيقاف' : 'Stop') : (isRTL ? 'تشغيل' : 'Play')}</span>
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
