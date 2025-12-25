
import React, { useState, useEffect, useRef } from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { ArrowLeft, ArrowRight, Moon, Play, Pause, Music, Clock, Volume2, Sparkles, BookOpen } from 'lucide-react';
import { audioGenerator } from '../services/audioGenerator';
import { generateSpeech, generateContent } from '../services/geminiService';
import { triggerHaptic } from '../services/hapticService';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
}

type SleepMode = 'MUSIC' | 'STORY';
type SleepStep = 'SETUP' | 'PLAYING';

const SleepSanctuary: React.FC<Props> = ({ user, language, onBack }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';

  const [step, setStep] = useState<SleepStep>('SETUP');
  const [mode, setMode] = useState<SleepMode>('MUSIC');
  const [duration, setDuration] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [trackName, setTrackName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneRef = useRef<any>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const grandmaName = localStorage.getItem('sakinnah_grandma_custom_name') || (isRTL ? 'ننا' : 'Nana');
  const childName = user.childName || user.name;

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const stopSession = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (droneRef.current) {
      droneRef.current.stop();
      droneRef.current = null;
    }
    if (currentSourceRef.current) {
      try { currentSourceRef.current.stop(); } catch(e) {}
      currentSourceRef.current = null;
    }
  };

  const startSession = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    setStep('PLAYING');
    setIsPlaying(true);
    setRemainingTime(duration * 60);
    setTrackName(mode === 'MUSIC' ? t.trackRelaxing : t.listeningToGrandma.replace('{name}', grandmaName));

    if (mode === 'MUSIC') {
      droneRef.current = audioGenerator.createMeditativeDrone(audioCtxRef.current);
      droneRef.current.masterGain.connect(audioCtxRef.current.destination);
      droneRef.current.start();
    } else {
      generateAndPlaySleepStory();
    }

    startTimer();
  };

  const generateAndPlaySleepStory = async () => {
    setIsGenerating(true);
    triggerHaptic();

    const prompt = `
    TASK: Tell a VERY calming, slow-paced, and hypnotic sleep story for a child named ${childName}.
    AUDIENCE: Children aged 3-8 years.
    PERSONA: You are Grandma ${grandmaName} (warm, nurturing female voice).
    
    RULES:
    1. STRUCTURE: Gentle setting -> Soothing characters -> Minimal stakes challenge -> Peaceful climax -> Deeply relaxing resolution for sleep.
    2. STYLE: Slow, rhythmic, repetitive, and calming language. Use hypnotic elements (heavy eyelids, soft breath).
    3. NAMES: Integrate "${childName}" and "${grandmaName}" naturally.
    4. NO AGE: Do NOT mention the child's specific age.
    5. FORMAT: Start the narrative immediately for audio narration.
    
    LANGUAGE: ${isRTL ? 'Modern Standard Arabic' : 'English'}.
    `;

    try {
      const storyText = await generateContent(prompt);
      if (storyText) {
        const result = await generateSpeech(storyText, 'Puck');
        if (result && result.audioBuffer && audioCtxRef.current) {
          const source = audioCtxRef.current.createBufferSource();
          source.buffer = result.audioBuffer;
          source.connect(audioCtxRef.current.destination);
          source.onended = () => {
            setIsPlaying(false);
            setStep('SETUP');
          };
          currentSourceRef.current = source;
          source.start(0);
          setIsGenerating(false);
        } else {
          setIsGenerating(false);
        }
      } else {
        setIsGenerating(false);
      }
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          stopSession();
          setStep('SETUP');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      audioCtxRef.current?.suspend();
      setIsPlaying(false);
    } else {
      audioCtxRef.current?.resume();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (step === 'SETUP') {
    return (
      <div className="h-full bg-slate-900 flex flex-col pt-safe pb-safe text-white animate-m3-fade-in overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#4c1d95,transparent_50%)] opacity-30"></div>
        
        <header className="px-6 py-6 flex items-center justify-between border-b border-white/5 z-20">
           <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl">
               {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
           </button>
           <h1 className="text-xl font-bold">{t.SLEEP}</h1>
           <div className="w-10"></div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative z-10 flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-40 h-40 bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center shadow-2xl animate-float">
              {mode === 'MUSIC' ? <Moon size={60} className="text-indigo-300" /> : <BookOpen size={60} className="text-amber-300" />}
          </div>

          <div className="flex bg-white/5 p-1 rounded-full border border-white/10 w-full max-w-xs">
              <button 
                onClick={() => setMode('MUSIC')}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all ${mode === 'MUSIC' ? 'bg-indigo-600 text-white' : 'text-white/40'}`}
              >
                  {t.sleepMusicMode}
              </button>
              <button 
                onClick={() => setMode('STORY')}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all ${mode === 'STORY' ? 'bg-amber-600 text-white' : 'text-white/40'}`}
              >
                  {t.sleepStoryMode}
              </button>
          </div>

          <div className="space-y-2">
              <h2 className="text-xl font-bold">{t.sleepDurationTitle}</h2>
              <div className="grid grid-cols-4 gap-3 w-full">
                  {[10, 20, 30, 40].map((d) => (
                      <button 
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`py-3 rounded-2xl font-bold text-sm border transition-all active:scale-95
                          ${duration === d ? 'bg-white/20 border-white/40' : 'bg-white/5 border-white/5 opacity-40'}`}
                      >
                          {d}'
                      </button>
                  ))}
              </div>
          </div>

          <button 
            onClick={startSession}
            className="w-full max-w-sm py-5 bg-white text-slate-900 rounded-[2rem] font-bold text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
              <Play size={20} fill="currentColor" />
              <span>{t.startMusic}</span>
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-950 flex flex-col pt-safe pb-safe text-white animate-m3-fade-in overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,#1e1b4b,transparent_70%)] opacity-80"></div>
      
      <header className="px-6 py-6 flex items-center justify-between border-b border-white/5 z-20">
         <button onClick={() => { stopSession(); setStep('SETUP'); }} className="p-3 bg-white/5 rounded-2xl">
             {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">{t.SLEEP}</span>
            <h1 className="text-sm font-bold opacity-60">{isGenerating ? t.storyLoading : (isPlaying ? t.aiComposing : t.pause)}</h1>
         </div>
         <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 relative z-10 flex flex-col items-center justify-center text-center space-y-16">
          <div className="relative">
              <div className={`absolute inset-[-60px] bg-indigo-500/10 rounded-full blur-[100px] transition-all duration-1000 ${isPlaying ? 'scale-150 opacity-100' : 'scale-100 opacity-20'}`}></div>
              
              <div className={`w-72 h-72 rounded-full border-4 border-white/5 flex items-center justify-center relative z-10 overflow-hidden
                ${isPlaying ? 'animate-pulse' : ''}`}>
                  <div className={`w-full h-full bg-gradient-to-tr from-indigo-950 to-slate-900 flex items-center justify-center`}>
                    {mode === 'MUSIC' ? <Music size={120} className="text-indigo-400/20" /> : <BookOpen size={120} className="text-amber-400/20" />}
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 px-10">
                     {[...Array(8)].map((_, i) => (
                       <div 
                        key={i} 
                        className={`w-1 bg-indigo-400/40 rounded-full transition-all duration-500 ${isPlaying ? 'animate-bounce' : 'h-2'}`}
                        style={{ height: isPlaying ? `${20 + Math.random() * 40}%` : '8px', animationDelay: `${i * 0.1}s` }}
                       />
                     ))}
                  </div>
              </div>
          </div>

          <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-indigo-300">
                  <Sparkles size={16} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">{trackName}</span>
              </div>
              <h2 className="text-5xl font-mono font-bold tracking-tighter text-white/90">{formatTime(remainingTime)}</h2>
          </div>

          <div className="flex gap-6 w-full max-w-sm justify-center items-center">
              <button 
                onClick={togglePlayback}
                className="w-24 h-24 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all"
              >
                  {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
              </button>

              <div className="w-16 h-16 flex items-center justify-center text-white/20">
                  <Volume2 size={24} />
              </div>
          </div>

          <div className="flex items-center gap-3 text-indigo-300/30 text-[9px] font-black uppercase tracking-[0.5em]">
              <div className="w-2 h-2 rounded-full bg-indigo-500/40 animate-pulse"></div>
              <span>{mode === 'MUSIC' ? 'Meditative Drone Synth' : 'Warm Female Grandma Voice'}</span>
          </div>
      </main>
    </div>
  );
};

export default SleepSanctuary;
