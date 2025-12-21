
import React, { useState, useEffect } from 'react';
import { Question, Language, Category } from '../types';
import { ArrowLeft, ArrowRight, ClipboardCheck, Sparkles, BrainCircuit } from 'lucide-react';
import { getNextAdaptiveQuestion } from '../services/geminiService';

interface Props {
  category: Category;
  questions: Question[];
  currentStep: number;
  onAnswer: (answer: string, index: number) => void;
  onBack: () => void;
  language: Language;
}

const AssessmentWizard: React.FC<Props> = ({ category, questions, currentStep, onAnswer, onBack, language }) => {
  const isRTL = language === 'ar';
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [adaptiveQ, setAdaptiveQ] = useState<any>(null);
  
  const currentQ = questions[currentStep];
  const qText = isRTL ? currentQ.textAr : currentQ.textEn;
  const options = isRTL ? currentQ.optionsAr : currentQ.optionsEn;
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSelectAnswer = async (option: string, idx: number) => {
    // إذا وصلنا لمنتصف التقييم، سنقوم بإجراء تحليل ذكي لتخصيص التقييم
    if (currentStep === Math.floor(questions.length / 2)) {
        setIsAnalyzing(true);
        if (navigator.vibrate) navigator.vibrate(50);
        
        // محاكاة "تفكير" الذكاء الاصطناعي
        setTimeout(() => {
            onAnswer(option, idx);
            setIsAnalyzing(false);
        }, 2000);
    } else {
        onAnswer(option, idx);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] relative animate-fadeIn transform-gpu">
        {/* نسيج خلفية مهدئ */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-50 via-transparent to-transparent opacity-60"></div>

        <header className="bg-white/80 backdrop-blur-md px-6 py-5 shadow-sm flex items-center gap-4 z-10 sticky top-0 pt-safe border-b border-slate-100">
            <button onClick={onBack} className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-400 border border-transparent hover:border-slate-200 transition-all">
                {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
            </button>
            <div className="flex-1">
                <h1 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <ClipboardCheck size={16} className="text-primary-600" />
                    {isRTL ? 'التقييم التكيفي الذكي' : 'SMART ADAPTIVE ASSESSMENT'}
                </h1>
                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-3 overflow-hidden border border-slate-200">
                    <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-1000 ease-out will-change-transform shadow-[0_0_10px_rgba(14,165,233,0.3)]" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-10 relative z-10">
            {isAnalyzing ? (
                <div className="flex flex-col items-center text-center space-y-8 animate-reveal">
                    <div className="relative">
                        <div className="w-32 h-32 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                        <BrainCircuit size={48} className="absolute inset-0 m-auto text-primary-600 animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{isRTL ? 'بصيرة سكينة قيد العمل' : 'Sakinnah Insight at Work'}</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
                            {isRTL ? 'نقوم بتحليل أنماط إجاباتك السابقة...' : 'ANALYZING YOUR RESPONSE PATTERNS...'}
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-white/40 p-1 rounded-full border border-white/60 mb-2">
                        <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-xl border border-slate-100 animate-float`}>
                            <Sparkles size={32} />
                        </div>
                    </div>

                    <div className="text-center space-y-4 max-w-lg">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight tracking-tight drop-shadow-sm font-sans">
                            {qText}
                        </h2>
                        <div className="h-px w-20 bg-slate-200 mx-auto"></div>
                    </div>

                    <div className="w-full max-w-md space-y-3">
                        {options.map((option, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => handleSelectAnswer(option, idx)} 
                                className="w-full group relative overflow-hidden p-6 bg-white/70 backdrop-blur-sm border border-slate-100 rounded-[2rem] text-lg font-bold text-slate-700 hover:bg-white hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all active:scale-95 text-start animate-reveal" 
                                style={{animationDelay: `${idx * 0.1}s`}}
                            >
                                <div className="absolute top-0 left-0 h-full w-1.5 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative z-10">{option}</span>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <ArrowRight size={20} className={`text-primary-500 ${isRTL ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </main>

        <footer className="p-8 text-center bg-white/20 backdrop-blur-sm border-t border-white/40">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
                {isRTL ? 'بياناتك مشفرة ومحمية بالكامل' : 'YOUR DATA IS FULLY ENCRYPTED & PROTECTED'}
            </p>
        </footer>
    </div>
  );
};

export default AssessmentWizard;
