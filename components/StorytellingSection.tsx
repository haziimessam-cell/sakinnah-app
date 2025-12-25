import React, { useState, useEffect, useRef } from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { generateSpeech, generateContent } from '../services/geminiService';
import { triggerHaptic } from '../services/hapticService';
import { STORY_NARRATIVE_OVERRIDE } from '../constants';
import { ArrowLeft, ArrowRight, Play, Pause, SkipForward, BookOpen, Volume2, Sparkles, Baby, UserCircle, Loader2 } from 'lucide-react';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
}

type StoryStep = 'SETUP_NAMES' | 'PLAYER';

const StorytellingSection: React.FC<Props> = ({ user, language, onBack }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';

  const [grandmaName, setGrandmaName] = useState('');
  const [childName, setChildName] = useState(''); 
  
  const [step, setStep] = useState<StoryStep>('SETUP_NAMES');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const storyQueueRef = useRef<AudioBuffer[]>([]);
  const queueIndexRef = useRef(0);
  const isAbortRef = useRef(false);

  useEffect(() => {
    return () => {
        isAbortRef.current = true;
        stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch (e) {}
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const playBuffer = (buffer: AudioBuffer, onEnd?: () => void) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    stopAudio();
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    source.onended = () => {
      if (isAbortRef.current) return;
      setIsPlaying(false);
      onEnd?.();
    };
    currentSourceRef.current = source;
    source.start(0);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const generateAndPlayStory = async () => {
    setIsGenerating(true);
    setProgressMessage(isRTL ? 'ننسج خيوط الحكاية...' : 'Weaving the narrative threads...');
    triggerHaptic();
    
    const finalPrompt = `
    ${STORY_NARRATIVE_OVERRIDE.replace('[CHILD_NAME]', childName).replace('[GRANDMA_NAME]', grandmaName)}
    
    TASK: Generate a full, high-quality story text following the 5-stage structure. 
    Language: ${isRTL ? 'Arabic (Modern Standard, warm tone)' : 'English'}.
    Ensure the text is long enough to reach approximately 10 minutes of spoken audio (roughly 1200-1500 words).
    Stage 1 MUST include the verbal ask: "Hello my dear, what is your name?" and wait (rhythmically) for the response as if you are listening, then proceed.
    `;

    try {
      const storyText = await generateContent(finalPrompt);
      if (storyText && !isAbortRef.current) {
        // Split text by paragraphs to process TTS in chunks for smoother playback
        const paragraphs = storyText.split(/\n\n+/).filter(p => p.trim().length > 5);
        storyQueueRef.current = [];
        queueIndexRef.current = 0;

        setProgressMessage(isRTL ? 'تجهيز صوت الجدة الدافئ...' : 'Preparing Grandma\'s warm voice...');
        
        // Generate first chunk immediately to start playing
        const firstBatch = paragraphs.slice(0, 2).join('\n\n');
        const res = await generateSpeech(firstBatch, 'Puck');
        
        if (res?.audioBuffer && !isAbortRef.current) {
            storyQueueRef.current.push(res.audioBuffer);
            setIsGenerating(false);
            playNextInQueue(paragraphs);
            
            // Background generate the rest
            for (let i = 2; i < paragraphs.length; i++) {
                if (isAbortRef.current) break;
                const partRes = await generateSpeech(paragraphs[i], 'Puck');
                if (partRes?.audioBuffer) {
                    storyQueueRef.current.push(partRes.audioBuffer);
                }
            }
        } else {
            setIsGenerating(false);
        }
      }
    } catch (e) { 
        console.error(e); 
        setIsGenerating(false); 
    }
  };

  const playNextInQueue = (allParagraphs: string[]) => {
    if (isAbortRef.current) return;
    
    if (queueIndexRef.current < storyQueueRef.current.length) {
      const buffer = storyQueueRef.current[queueIndexRef.current];
      queueIndexRef.current++;
      playBuffer(buffer, () => playNextInQueue(allParagraphs));
    } else {
      // If we finished the queue but more text was expected, wait a bit
      if (queueIndexRef.current < allParagraphs.length) {
          setTimeout(() => playNextInQueue(allParagraphs), 2000);
      } else {
          // Entire story finished
          setStep('SETUP_NAMES');
      }
    }
  };

  const handleStartStory = () => {
    if (!grandmaName.trim() || !childName.trim()) return;
    setStep('PLAYER');
    isAbortRef.current = false;
    generateAndPlayStory();
  };

  if (step === 'SETUP_NAMES') {
    return (
      <div className="h-full bg-[#FFFBF0] flex flex-col pt-safe animate-m3-fade-in">
        <header className="px-6 py-6"><button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm text-amber-900">{isRTL ? <ArrowRight size={24}/> : <ArrowLeft size={24}/>}</button></header>
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-amber-600 shadow-xl border border-amber-100 animate-float"><BookOpen size={48} /></div>
            <h2 className="text-2xl font-bold text-amber-900">{isRTL ? 'حكايات الجدة' : "Grandma's Stories"}</h2>
            <div className="w-full max-w-xs space-y-4">
                <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-300" size={18} />
                    <input value={grandmaName} onChange={e => setGrandmaName(e.target.value)} placeholder={t.grandmaNamePlaceholder} className="w-full bg-white border-2 border-amber-100 rounded-2xl py-4 pl-12 pr-6 text-center focus:border-amber-500 outline-none font-medium"/>
                </div>
                <div className="relative">
                    <Baby className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-300" size={18} />
                    <input value={childName} onChange={e => setChildName(e.target.value)} placeholder={t.childNameLabel} className="w-full bg-white border-2 border-amber-100 rounded-2xl py-4 pl-12 pr-6 text-center focus:border-amber-500 outline-none font-medium"/>
                </div>
                <button onClick={handleStartStory} disabled={!grandmaName.trim() || !childName.trim()} className="w-full py-5 bg-amber-600 text-white rounded-full font-bold shadow-lg disabled:opacity-50 active:scale-95 transition-all">
                    {isRTL ? 'بدء الحكاية' : 'Start Story'}
                </button>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#FFFBF0] flex flex-col animate-m3-fade-in relative overflow-hidden">
      <header className="px-6 py-6 flex items-center justify-between z-20">
        <button onClick={() => { isAbortRef.current = true; stopAudio(); setStep('SETUP_NAMES'); }} className="p-3 bg-white/50 text-amber-900 rounded-2xl shadow-sm">
          {isRTL ? <ArrowRight size={24}/> : <ArrowLeft size={24}/>}
        </button>
        <div className="text-center">
            <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">{t.STORYTELLING}</span>
            <h1 className="text-sm font-bold text-amber-900">{t.listeningToGrandma.replace('{name}', grandmaName)}</h1>
        </div>
        <div className="w-12"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 text-center space-y-12">
          <div className={`w-64 h-64 rounded-[4rem] bg-white border-8 border-white shadow-2xl flex items-center justify-center relative transition-all duration-700 ${isPlaying ? 'scale-105' : ''}`}>
              <div className="text-8xl animate-float">👵</div>
              {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-[4rem]">
                      <Loader2 className="w-12 h-12 text-amber-600 animate-spin" />
                  </div>
              )}
          </div>
          
          <div className="space-y-4 max-w-sm">
              <div className="flex flex-col items-center justify-center gap-2 text-amber-600">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className={isPlaying ? 'animate-spin' : 'animate-pulse'} />
                    <span className="text-xs font-bold uppercase tracking-widest">
                        {isGenerating ? t.storyLoading : (isPlaying ? (isRTL ? 'تستمع الآن للحكاية...' : 'Listening to the story...') : t.audioOnlyNote)}
                    </span>
                  </div>
                  {isGenerating && <p className="text-[10px] font-medium opacity-60 animate-pulse">{progressMessage}</p>}
              </div>
          </div>

          <div className="flex items-center gap-8 pt-8">
              <button 
                onClick={() => { 
                    if(isPaused) audioCtxRef.current?.resume(); 
                    else audioCtxRef.current?.suspend(); 
                    setIsPaused(!isPaused); 
                    setIsPlaying(isPaused); 
                }} 
                disabled={isGenerating} 
                className="w-24 h-24 bg-amber-600 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all disabled:opacity-30"
              >
                  {isPaused ? <Play size={40} fill="currentColor"/> : <Pause size={40} fill="currentColor"/>}
              </button>
              <button 
                onClick={() => { stopAudio(); storyQueueRef.current=[]; queueIndexRef.current=0; generateAndPlayStory(); }} 
                disabled={isGenerating} 
                className="w-16 h-16 bg-white border-2 border-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-30"
              >
                  <SkipForward size={28}/>
              </button>
          </div>
      </main>
    </div>
  );
};

export default StorytellingSection;
