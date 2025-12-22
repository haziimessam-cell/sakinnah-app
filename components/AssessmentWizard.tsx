
import React from 'react';
import { Question, Language, Category } from '../types';
import { ArrowLeft, ArrowRight, ClipboardCheck, Sparkles } from 'lucide-react';

interface Props {
  category: Category;
  questions: Question[];
  currentStep: number;
  onAnswer: (answer: string) => void;
  onBack: () => void;
  language: Language;
}

const AssessmentWizard: React.FC<Props> = ({ category, questions, currentStep, onAnswer, onBack, language }) => {
  const isRTL = language === 'ar';
  const currentQ = questions[currentStep];
  if (!currentQ) return null;

  const qText = isRTL ? currentQ.textAr : currentQ.textEn;
  const options = isRTL ? currentQ.optionsAr : currentQ.optionsEn;
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="h-full bg-slate-50 flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden">
      <header className="px-8 py-6 bg-white/60 backdrop-blur-xl border-b border-slate-100 flex items-center gap-4">
        <button onClick={onBack} className="p-2.5 bg-white rounded-xl text-slate-400 border border-slate-100 active:scale-90 transition-all">
          {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <div className="flex-1">
            <h1 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ClipboardCheck size={14} className="text-blue-500" />
                {isRTL ? 'تقييم ما قبل الجلسة' : 'PRE-SESSION ASSESSMENT'}
            </h1>
            <div className="h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-500 shadow-xl border border-slate-100 animate-float">
              <Sparkles size={32} />
          </div>

          <div className="text-center space-y-4">
              <h2 className="text-2xl font-black text-slate-800 leading-tight tracking-tight max-w-sm mx-auto">
                  {qText}
              </h2>
          </div>

          <div className="w-full max-w-md space-y-3">
              {options.map((option, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => onAnswer(option)}
                    className="w-full p-6 bg-white border border-slate-100 rounded-[2rem] text-lg font-bold text-slate-700 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all active:scale-[0.98] text-start animate-reveal"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                      {option}
                  </button>
              ))}
          </div>
      </main>

      <footer className="p-10 text-center opacity-30">
          <p className="text-[9px] font-black uppercase tracking-[0.4em]">{isRTL ? 'بياناتك مشفرة ومحمية' : 'YOUR DATA IS PROTECTED'}</p>
      </footer>
    </div>
  );
};

export default AssessmentWizard;
