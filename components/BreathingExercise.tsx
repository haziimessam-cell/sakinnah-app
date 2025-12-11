
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { X, Play, RotateCcw } from 'lucide-react';
import { translations } from '../translations';

interface Props {
  onClose: () => void;
  language: Language;
}

const BreathingExercise: React.FC<Props> = ({ onClose, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [text, setText] = useState(t.startBreathing);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;

      if (phase === 'inhale') {
          setText(t.inhale);
          if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
          timer = setTimeout(() => setPhase('hold'), 4000);
      } else if (phase === 'hold') {
          setText(t.hold);
          timer = setTimeout(() => setPhase('exhale'), 7000);
      } else if (phase === 'exhale') {
          setText(t.exhale);
          if (navigator.vibrate) navigator.vibrate(200);
          timer = setTimeout(() => setPhase('inhale'), 8000); // Loop
      }

      return () => clearTimeout(timer);
  }, [phase, t]);

  const startSession = () => {
      setPhase('inhale');
  };

  const stopSession = () => {
      setPhase('idle');
      setText(t.startBreathing);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-900 to-slate-900 flex flex-col items-center justify-center animate-fadeIn overflow-hidden">
      
      {/* Ambient Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full backdrop-blur-md z-50 hover:bg-white/20 transition-all">
          <X size={24} />
      </button>

      <div className="relative z-10 flex flex-col items-center">
          
          <h2 className="text-white/80 text-lg font-medium tracking-widest uppercase mb-12">{t.serenityZone}</h2>

          <div className="relative w-72 h-72 flex items-center justify-center mb-12">
              {/* Static Rings */}
              <div className={`absolute w-full h-full border border-white/10 rounded-full ${phase !== 'idle' ? 'scale-100 opacity-20' : 'scale-90 opacity-10'} transition-all duration-[4s]`}></div>
              <div className={`absolute w-[80%] h-[80%] border border-white/20 rounded-full ${phase !== 'idle' ? 'scale-100 opacity-30' : 'scale-90 opacity-20'} transition-all duration-[4s]`}></div>
              
              {/* Animated Core */}
              <div 
                className={`w-32 h-32 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-xl shadow-[0_0_50px_rgba(56,189,248,0.5)] transition-all ease-in-out
                ${phase === 'inhale' ? 'duration-[4000ms] scale-[2.5] opacity-100' : 
                  phase === 'hold' ? 'duration-[7000ms] scale-[2.5] opacity-90' : 
                  phase === 'exhale' ? 'duration-[8000ms] scale-[1] opacity-60' : 'scale-100 opacity-80'}`}
              ></div>
              
              <div className={`absolute text-3xl font-bold text-white drop-shadow-lg transition-all duration-500 ${phase === 'hold' ? 'scale-110' : 'scale-100'}`}>
                  {text}
              </div>
          </div>

          <div className="h-12">
            {phase === 'idle' ? (
                <button onClick={startSession} className="bg-white/10 text-white px-8 py-3 rounded-full backdrop-blur-md border border-white/20 font-bold flex items-center gap-2 hover:bg-white/20 transition-all active:scale-95 shadow-lg">
                    <Play size={20} fill="currentColor" />
                    <span>{t.start}</span>
                </button>
            ) : (
                <button onClick={stopSession} className="text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm">
                    <RotateCcw size={16} />
                    <span>{t.stop}</span>
                </button>
            )}
          </div>
          
          <p className="absolute bottom-10 text-white/30 text-xs max-w-xs text-center leading-relaxed">
             {t.breathingDesc}
          </p>

      </div>
    </div>
  );
};

export default BreathingExercise;
