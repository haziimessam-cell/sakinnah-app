
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { ArrowLeft, ArrowRight, Heart, Wind, X } from 'lucide-react';

interface Props {
  language: Language;
  onBack: () => void;
}

const CoRegulator: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => p === 'in' ? 'out' : 'in');
      if (navigator.vibrate) {
          // نبضة قوية في الشهيق، نبضة ممتدة في الزفير
          navigator.vibrate(phase === 'in' ? [100, 50, 100] : 300);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="fixed inset-0 z-50 bg-teal-900 flex flex-col items-center justify-center animate-fadeIn overflow-hidden">
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button onClick={onBack} className="p-3 bg-white/10 text-white rounded-full">
          {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h2 className="text-teal-100 font-black uppercase tracking-widest text-xs">{t.rel_tool_regulator}</h2>
        <div className="w-10"></div>
      </div>

      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-[150vw] h-[150vw] bg-teal-400/10 rounded-full blur-[100px] transition-all duration-[4000ms] ${phase === 'in' ? 'scale-110' : 'scale-75'}`}></div>
        </div>

        <div className="relative z-10 space-y-12 flex flex-col items-center">
           <div className={`w-64 h-64 rounded-full border-4 border-teal-400/30 flex items-center justify-center transition-all duration-[4000ms] ease-in-out ${phase === 'in' ? 'scale-125' : 'scale-90'}`}>
              <div className={`w-32 h-32 bg-teal-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(45,212,191,0.5)] transition-all duration-[4000ms] ${phase === 'in' ? 'scale-100 opacity-100' : 'scale-50 opacity-50'}`}>
                  <Heart size={48} className="text-white fill-white animate-pulse" />
              </div>
           </div>

           <div className="text-center space-y-4">
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">
                {phase === 'in' ? (isRTL ? 'شهيق مشترك' : 'INHALA TOGETHER') : (isRTL ? 'زفير مشترك' : 'EXHALE TOGETHER')}
              </h3>
              <p className="text-teal-300 text-sm max-w-xs mx-auto font-medium">
                {t.rel_regulator_desc}
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CoRegulator;
