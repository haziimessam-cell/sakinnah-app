
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { sendMessageStreamToGemini, initializeChat, generateSpeech } from '../services/geminiService';
import { 
  ArrowRight, ArrowLeft, Moon, Play, Pause, Sparkles, Volume2, 
  ShieldCheck, BookOpen, Music, ChevronRight, Waves, CloudRain, 
  Wind, TreePine, Wand2, Sliders, VolumeX, Mic2, Loader2, Zap, Ghost
} from 'lucide-react';

interface Props {
  onBack: () => void;
  language: Language;
}

const SleepSanctuary: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [view, setView] = useState<'selection' | 'mixer' | 'dream-weaver' | 'playing'>('selection');
  const [dreamTheme, setDreamTheme] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSoundscapes, setActiveSoundscapes] = useState<string[]>([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [narrativeProgress, setNarrativeProgress] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const storyQueueRef = useRef<AudioBuffer[]>([]);
  const currentStorySourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const [auraScale, setAuraScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setAuraScale(prev => (prev === 1 ? 1.4 : 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stopAll = useCallback(() => {
    if (currentStorySourceRef.current) {
        try { currentStorySourceRef.current.stop(); } catch(e){}
    }
    storyQueueRef.current = [];
    setIsSpeaking(false);
    setIsGenerating(false);
    setNarrativeProgress(0);
  }, []);

  const playStoryQueue = useCallback(async () => {
      if (storyQueueRef.current.length === 0) {
          setIsSpeaking(false);
          return;
      }
      setIsSpeaking(true);
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const buffer = storyQueueRef.current.shift()!;
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtxRef.current.destination);
      currentStorySourceRef.current = source;
      source.onended = () => {
          setNarrativeProgress(prev => Math.min(100, prev + 10));
          playStoryQueue();
      };
      source.start();
  }, []);

  const generateDreamStory = async () => {
      if (!dreamTheme.trim()) return;
      setIsGenerating(true);
      setView('playing');
      setStoryTitle(isRTL ? `متاهة ${dreamTheme}` : `The Labyrinth of ${dreamTheme}`);

      // High Intensity / Complex Plot Prompt
      const prompt = isRTL 
        ? `أنت حكواتي سينمائي خبير. ابدأ رحلة سردية مدتها 10 دقائق حول "${dreamTheme}". 
           المطلوب:
           1. ابدأ بلغز أو موقف غامض يشد الأنفاس فوراً.
           2. قلل التفاصيل الوصفية المملة وركز على الأحداث المتسارعة والمفاجآت (Plot Twists).
           3. اجعل الحبكة معقدة (مثلاً: البطل يكتشف أنه في حلم، أو أن المكان الذي يبحث عنه موجود بداخله).
           4. يجب أن يكون السرد "تشويقياً نفسياً" (Psychological Thriller) لكن بلغة فخمة وهادئة.
           5. في الدقيقة العاشرة، قم بحل العقدة بشكل مدهش يؤدي للسكينة التامة.`
        : `You are an expert cinematic narrator. Create a 10-minute narrative journey about "${dreamTheme}".
           Requirements:
           1. Start with a mystery or a high-stakes scene immediately.
           2. Minimize flowery details, focus on fast-paced events and major plot twists.
           3. Use a complex plot (e.g., characters discovering they are within a memory).
           4. The tone should be "Psychological Thriller" but delivered in a calm, hypnotic voice.
           5. At the 10-minute mark, resolve the complexity into a profound sense of peace.`;

      try {
          // Increase narrative complexity settings
          await initializeChat("CinematicNarrator", "Expert Mystery Storyteller Persona", [], language);
          const stream = sendMessageStreamToGemini(prompt, language);
          let fullText = "";
          for await (const chunk of stream) fullText += chunk;

          // Split into impactful narrative beats
          const segments = fullText.split(/[.؟!]+/).filter(s => s.trim().length > 15);
          for (const segment of segments) {
              const audio = await generateSpeech(segment, 'kore');
              if (audio) storyQueueRef.current.push(audio.audioBuffer);
              if (!isSpeaking) playStoryQueue();
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <div className="h-full bg-white flex flex-col pt-safe pb-safe animate-ios-reveal text-ios-azureDeep overflow-hidden relative">
      <header className="px-6 py-6 flex items-center justify-between border-b border-ios-azure/5 z-20 sticky top-0 bg-white/80 backdrop-blur-xl">
         <button onClick={() => { stopAll(); if (view === 'selection') onBack(); else setView('selection'); }} className="w-12 h-12 bg-ios-slate rounded-full flex items-center justify-center text-ios-azure active:scale-90 transition-all">
             {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <div className="text-center">
            <h1 className="text-[17px] font-bold tracking-tight">{isRTL ? 'محراب السكينة' : 'The Sanctuary'}</h1>
            <div className="flex items-center justify-center gap-1">
                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{isRTL ? 'وضع الإثارة النفسية' : 'PSYCHOLOGICAL THRILLER MODE'}</span>
            </div>
         </div>
         <div className="w-12"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 relative z-10 no-scrollbar">
          {view === 'selection' && (
              <div className="space-y-6 animate-ios-reveal">
                  <div className="bg-gradient-to-br from-ios-azureDeep to-black p-8 rounded-[40px] text-white relative overflow-hidden group shadow-2xl">
                      <Zap className="text-ios-azure mb-4 opacity-100 group-hover:scale-125 transition-transform" size={40} />
                      <h2 className="text-2xl font-bold mb-2">{isRTL ? 'تحدي العقل الباطن' : 'Subconscious Challenge'}</h2>
                      <p className="text-[14px] text-white/60 font-medium">{isRTL ? 'رحلات سردية معقدة مدتها 10 دقائق، صممت لتشغل عقلك بالكامل قبل أن تغفو.' : '10-minute complex narrative journeys designed to fully engage your mind before sleep.'}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                      <button onClick={() => setView('dream-weaver')} className="ios-card p-8 flex items-center gap-6 group border-red-50">
                          <div className="w-16 h-16 bg-red-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-red-600/20 group-hover:scale-105 transition-transform duration-500">
                              <Ghost size={32} />
                          </div>
                          <div className="flex-1 text-start">
                              <h3 className="text-[19px] font-bold mb-1">{isRTL ? 'رحلة الغموض' : 'The Mystery Journey'}</h3>
                              <p className="text-[13px] text-red-600/40 font-semibold">{isRTL ? 'حبكة معقدة وإثارة نفسية' : 'Complex plot & psychological thrill'}</p>
                          </div>
                          <ChevronRight className="text-red-600/20" size={24} />
                      </button>
                  </div>
              </div>
          )}

          {view === 'dream-weaver' && (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-12 animate-ios-reveal p-4">
                  <div className="w-32 h-32 bg-red-50 rounded-[40px] flex items-center justify-center text-red-600 animate-pulse shadow-inner">
                      <Zap size={64} />
                  </div>
                  <div className="space-y-4">
                      <h2 className="text-3xl font-bold tracking-tighter text-ios-azureDeep">{isRTL ? 'ما هو مسرح أحداثك؟' : 'Where is your stage?'}</h2>
                      <p className="text-[16px] text-ios-azure/40 font-medium px-8">{isRTL ? 'أدخل مكاناً أو فكرة، وسنقوم بحياكة لغز معقد حولها.' : 'Enter a place or idea, and we will weave a complex mystery around it.'}</p>
                  </div>
                  <div className="w-full max-w-sm relative">
                      <input 
                        type="text" 
                        value={dreamTheme}
                        onChange={(e) => setDreamTheme(e.target.value)}
                        placeholder={isRTL ? "مثلاً: قصر المرايا، المحطة المفقودة..." : "e.g. Mirror Palace, Lost Station..."}
                        className="w-full bg-ios-slate border-2 border-transparent focus:border-red-600/20 rounded-[28px] py-6 px-8 text-lg font-bold outline-none transition-all"
                      />
                  </div>
                  <button 
                    onClick={generateDreamStory}
                    disabled={!dreamTheme.trim()}
                    className="w-full max-w-xs h-20 bg-red-600 text-white rounded-[32px] font-bold text-xl shadow-2xl active:scale-95 transition-all disabled:opacity-30"
                  >
                      <span>{isRTL ? 'بدء اللغز' : 'Begin the Mystery'}</span>
                  </button>
              </div>
          )}

          {view === 'playing' && (
              <div className="h-full flex flex-col items-center justify-center min-h-[600px] py-10">
                  <div className="relative mb-20">
                      <div className="absolute inset-[-80px] rounded-full bg-red-500/5 blur-[80px] transition-transform duration-[10000ms] ease-in-out" style={{ transform: `scale(${auraScale * 1.5})` }}></div>
                      
                      <div className={`w-64 h-64 rounded-[60px] bg-white border border-red-100 flex items-center justify-center shadow-2xl relative z-10 transition-all duration-1000 ${isSpeaking ? 'scale-110 shadow-red-200' : 'scale-100'}`}>
                          {isGenerating ? (
                              <div className="flex flex-col items-center gap-4">
                                  <Loader2 size={48} className="text-red-600 animate-spin" />
                                  <span className="text-[10px] font-black uppercase tracking-widest animate-pulse text-red-600">{isRTL ? 'جاري بناء الحبكة' : 'Building Plot'}</span>
                              </div>
                          ) : (
                              <div className="relative">
                                <Zap size={110} className={`text-red-600 transition-all duration-1000 ${isSpeaking ? 'opacity-100 scale-110' : 'opacity-20'}`} />
                                <div className="absolute -top-4 -right-4 w-6 h-6 bg-red-600 rounded-full animate-ping"></div>
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="text-center space-y-4 mb-16 relative z-10 w-full px-8">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{isRTL ? 'تطور القصة' : 'NARRATIVE PROGRESS'}</span>
                         <span className="text-[10px] font-bold text-ios-azure/40">{narrativeProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-ios-slate rounded-full overflow-hidden">
                          <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${narrativeProgress}%` }}></div>
                      </div>
                      <h3 className="text-3xl font-extrabold tracking-tight text-ios-azureDeep mt-6">{storyTitle}</h3>
                  </div>

                  <div className="w-full max-w-xs flex items-center gap-4">
                      <button 
                        onClick={() => { if(isSpeaking) { stopAll(); setView('selection'); } else playStoryQueue(); }} 
                        className="flex-1 h-24 bg-ios-azureDeep text-white rounded-[32px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl"
                      >
                          {isSpeaking ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" />}
                          <span className="text-xl font-bold">{isSpeaking ? (isRTL ? 'إيقاف' : 'Stop') : (isRTL ? 'استمرار' : 'Resume')}</span>
                      </button>
                  </div>
                  
                  <p className="mt-8 text-[11px] font-bold text-red-600/40 uppercase tracking-[0.2em] animate-pulse">
                      {isRTL ? 'استمع جيداً، الحل بداخل القصة...' : 'Listen closely, the solution is within...'}
                  </p>
              </div>
          )}
      </main>
    </div>
  );
};

export default SleepSanctuary;
