import React from 'react';
import { Question, Language } from '../types';
import { ArrowLeft, ArrowRight, ClipboardCheck } from 'lucide-react';

interface Props {
  questions: Question[];
  currentStep: number;
  onAnswer: (answer: string, index: number) => void;
  onBack: () => void;
  language: Language;
}

const AssessmentWizard: React.FC<Props> = ({ questions, currentStep, onAnswer, onBack, language }) => {
  const isRTL = language === 'ar';
  const currentQ = questions[currentStep];
  const qText = isRTL ? currentQ.textAr : currentQ.textEn;
  const options = isRTL ? currentQ.optionsAr : currentQ.optionsEn;
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full bg-transparent relative animate-fadeIn transform-gpu">
        <header className="bg-white/40 backdrop-blur-md px-4 py-4 shadow-sm flex items-center gap-3 z-10 sticky top-0 pt-safe border-b border-white/20">
            <button onClick={onBack} className="p-2 hover:bg-white/60 rounded-full text-gray-600 border border-transparent hover:border-white/40 transition-all">
                {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </button>
            <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">{isRTL ? 'تقييم الحالة العلمي' : 'Clinical Assessment'}</h1>
                <div className="h-1 w-full bg-white/40 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-primary-500 transition-all duration-500 ease-out will-change-transform" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 no-scrollbar">
            <div className={`w-20 h-20 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-primary-600 mb-4 shadow-lg border border-white/40`}>
                <ClipboardCheck size={40} className="text-primary-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 leading-normal max-w-lg drop-shadow-sm">{qText}</h2>
            <div className="w-full max-w-md space-y-3">
                {options.map((option, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => onAnswer(option, idx)} 
                        className="w-full p-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl text-lg font-medium text-gray-800 hover:bg-white/80 hover:scale-[1.02] transition-all shadow-sm active:scale-95 text-start animate-slideUp" 
                        style={{animationDelay: `${idx * 0.05}s`}}
                    >
                        {option}
                    </button>
                ))}
            </div>
            <p className="text-gray-500 text-sm mt-8 text-center px-4 font-medium">
                {isRTL ? 'إجاباتك تساعدنا في بناء خطة علاجية مخصصة لك.' : 'Your answers help us build a personalized treatment plan.'}
            </p>
        </main>
    </div>
  );
};

export default AssessmentWizard;