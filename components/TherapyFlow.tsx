
import React, { useState, useEffect } from 'react';
import { User, Language, Category, Question, BookedSession, CaseReportData, TherapyCategory } from '../types';
import { generateTherapeuticQuestions, generateCaseReport } from '../services/geminiService';
import { translations } from '../translations';
import AssessmentWizard from './AssessmentWizard';
import BookingCalendar from './BookingCalendar';
import ChatInterface from './ChatInterface';
import { 
  ArrowLeft, ArrowRight, Loader2, ClipboardList, ShieldCheck, 
  ChevronRight, HeartPulse, Brain, Zap, Moon, Users, Puzzle, Activity, Sparkles, BookOpen, ListChecks, Bookmark, Info, Target, Footprints, ZapIcon
} from 'lucide-react';
import { triggerHaptic } from '../services/hapticService';

interface Props {
  user: User;
  category: Category;
  language: Language;
  onBack: () => void;
  therapyMode: 'GENERAL' | 'STORYTELLING' | 'DISTINCT_MINDS';
}

type FlowStep = 'SELECTION' | 'PROFILE_CARD' | 'LOADING' | 'ASSESSMENT' | 'REPORT' | 'BOOKING' | 'CHAT';

const CLINICS: { id: string; icon: any; color: string }[] = [
  { id: 'DEPRESSION', icon: Brain, color: 'bg-blue-600' },
  { id: 'ANXIETY', icon: Zap, color: 'bg-orange-500' },
  { id: 'OCD', icon: HeartPulse, color: 'bg-red-500' },
  { id: 'BIPOLAR', icon: Moon, color: 'bg-purple-600' },
  { id: 'SOCIAL_PHOBIA', icon: Users, color: 'bg-emerald-600' },
];

const NEURO_CLINICS: { id: string; icon: any; color: string }[] = [
  { id: 'AUTISM', icon: Puzzle, color: 'bg-teal-600' },
  { id: 'ADHD', icon: Activity, color: 'bg-amber-500' },
];

const TherapyFlow: React.FC<Props> = ({ user, category, language, onBack, therapyMode }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const isNeuroMode = therapyMode === 'DISTINCT_MINDS';

  const [step, setStep] = useState<FlowStep>('SELECTION');
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<{question: string, answer: string}[]>([]);
  const [report, setReport] = useState<CaseReportData | null>(null);

  const clinicsToDisplay = isNeuroMode ? NEURO_CLINICS : CLINICS;

  const showProfileCard = (clinicId: string) => {
    setSelectedClinic(clinicId);
    setStep('PROFILE_CARD');
    triggerHaptic();
  };

  const startAssessment = async () => {
    setStep('LOADING');
    triggerHaptic();
    const q = await generateTherapeuticQuestions(selectedClinic!, language);
    setQuestions(q);
    setStep('ASSESSMENT');
  };

  const handleAnswer = async (answer: string) => {
    const currentQ = questions[currentQuestionIdx];
    const newAnswers = [...answers, { question: currentQ.textEn, answer }];
    setAnswers(newAnswers);
    triggerHaptic();

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      setStep('LOADING');
      const rep = await generateCaseReport(selectedClinic!, newAnswers, language);
      setReport(rep);
      if (rep) {
        const existing = JSON.parse(localStorage.getItem('sakinnah_clinical_records') || '[]');
        localStorage.setItem('sakinnah_clinical_records', JSON.stringify([{
            ...rep,
            id: `rep_${Date.now()}`,
            type: 'CASE_REPORT',
            date: new Date().toISOString()
        }, ...existing]));
      }
      setStep('REPORT');
    }
  };

  if (step === 'SELECTION') {
    return (
      <div className="h-full bg-m3-background flex flex-col animate-m3-fade-in">
        <header className="px-6 py-6 border-b border-m3-outline/10 bg-white flex items-center gap-4">
          <button onClick={onBack} className="p-3 hover:bg-m3-surfaceVariant rounded-m3-lg transition-all text-m3-primary">
            {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
          </button>
          <h1 className="text-xl font-bold text-m3-onSurface">
            {isNeuroMode ? t.selectNeuroType : t.selectTherapyType}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <div className={`p-8 rounded-m3-xl shadow-premium relative overflow-hidden mb-4 ${isNeuroMode ? 'bg-m3-tertiary' : 'bg-m3-primary'} text-white`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12"><ShieldCheck size={140} /></div>
              <h2 className="text-2xl font-black mb-2 tracking-tight">{isNeuroMode ? t.DISTINCT_MINDS : t.THERAPY}</h2>
              <p className="text-sm opacity-80 leading-relaxed font-medium max-w-[80%]">{isNeuroMode ? t.DISTINCT_MINDS_DESC : t.THERAPY_DESC}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 pb-32">
              {clinicsToDisplay.map((clinic) => {
                const Icon = clinic.icon;
                return (
                  <button 
                    key={clinic.id} 
                    onClick={() => showProfileCard(clinic.id)}
                    className="p-5 bg-white border border-m3-outline/10 rounded-m3-lg flex items-center gap-5 hover:border-m3-primary shadow-soft transition-all active:scale-[0.98] text-start group"
                  >
                    <div className={`w-14 h-14 ${clinic.color} rounded-m3-md flex items-center justify-center text-white shadow-lg group-hover:rotate-3 transition-all`}>
                      <Icon size={26} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-m3-onSurface text-lg">{t[clinic.id]}</h3>
                      <p className="text-[10px] font-black text-m3-onSurfaceVariant/40 uppercase tracking-widest">
                        {isNeuroMode ? 'Mama May Protocol' : 'Clinical Standard'}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-m3-outline group-hover:translate-x-1 transition-all" />
                  </button>
                )
              })}
          </div>
        </main>
      </div>
    );
  }

  if (step === 'PROFILE_CARD') {
    const desc = t[`cat_${selectedClinic}_desc`];
    const symptoms = t[`cat_${selectedClinic}_symptoms`];
    const refs = t[`cat_${selectedClinic}_refs`];
    const methods = t[`cat_${selectedClinic}_methods`];
    
    return (
      <div className="h-full bg-white flex flex-col animate-m3-slide-up overflow-hidden">
        <header className="px-6 py-6 border-b border-m3-outline/10 bg-white flex items-center gap-4">
          <button onClick={() => setStep('SELECTION')} className="p-3 hover:bg-m3-surfaceVariant rounded-m3-lg text-m3-primary">
            {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
          </button>
          <h1 className="text-xl font-bold text-m3-onSurface">{t.profileCardTitle}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
           <div className="bg-m3-primaryContainer/50 p-8 rounded-m3-xl border border-m3-primary/10 text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-m3-primary/5 rounded-full -mr-16 -mt-16"></div>
              <div className="w-16 h-16 bg-white text-m3-primary rounded-m3-lg flex items-center justify-center mx-auto shadow-sm border border-m3-outline/10">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-black text-m3-onSurface tracking-tight">{t[selectedClinic!]}</h2>
              <p className="text-m3-onSurfaceVariant text-[15px] font-medium leading-relaxed px-2">{desc}</p>
           </div>

           <div className="grid grid-cols-1 gap-6">
              <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-[11px] font-black text-m3-onSurfaceVariant/40 uppercase tracking-[0.25em] px-1">
                    <Info size={14} /> {t.symptomsLabel}
                  </h3>
                  <div className="bg-m3-background p-5 rounded-m3-lg border border-m3-outline/10 shadow-soft">
                    <div className="text-[14px] text-m3-onSurface font-medium whitespace-pre-line leading-relaxed">
                      {symptoms}
                    </div>
                  </div>
              </section>
              <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-[11px] font-black text-m3-onSurfaceVariant/40 uppercase tracking-[0.25em] px-1">
                    <ListChecks size={14} /> {t.methodsLabel}
                  </h3>
                  <div className="bg-m3-background p-5 rounded-m3-lg border border-m3-outline/10 shadow-soft">
                    <div className="text-[14px] text-m3-onSurface font-medium whitespace-pre-line leading-relaxed">
                      {methods}
                    </div>
                  </div>
              </section>
              <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-[11px] font-black text-m3-onSurfaceVariant/40 uppercase tracking-[0.25em] px-1">
                    <Bookmark size={14} /> {t.referencesLabel}
                  </h3>
                  <div className="bg-m3-background p-5 rounded-m3-lg border border-m3-outline/10 shadow-soft">
                    <div className="text-[13px] text-m3-onSurfaceVariant/60 font-bold whitespace-pre-line leading-relaxed italic">
                      {refs}
                    </div>
                  </div>
              </section>
           </div>

           <button 
             onClick={startAssessment}
             className="w-full py-5 bg-m3-primary text-white rounded-m3-full font-bold text-lg shadow-premium hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
           >
             <span>{t.nextToAssessment}</span>
             <ChevronRight size={22} className={isRTL ? 'rotate-180' : ''} />
           </button>
        </main>
      </div>
    );
  }

  if (step === 'LOADING') {
    return (
      <div className="h-full bg-white flex flex-col items-center justify-center p-10 text-center animate-m3-fade-in">
        <Loader2 size={64} className="text-m3-primary animate-spin mb-8" />
        <h2 className="text-2xl font-bold text-m3-onSurface mb-2">{t.aiThinking}</h2>
        <p className="text-sm text-m3-onSurfaceVariant/50 font-medium tracking-wide uppercase">{isRTL ? 'جاري تطبيق البروتوكولات العلمية المعتمدة...' : 'Applying Clinical Standards...'}</p>
      </div>
    );
  }

  if (step === 'ASSESSMENT') {
    return (
      <AssessmentWizard 
        category={category} 
        questions={questions} 
        currentStep={currentQuestionIdx} 
        onAnswer={handleAnswer} 
        onBack={() => setStep('SELECTION')} 
        language={language} 
      />
    );
  }

  if (step === 'REPORT') {
    return (
      <div className="h-full bg-m3-background flex flex-col animate-m3-slide-up overflow-hidden">
        <header className="px-6 py-6 border-b border-m3-outline/10 bg-white flex items-center justify-between">
           <h1 className="text-xl font-bold text-m3-onSurface flex items-center gap-3">
             <ClipboardList size={22} className="text-m3-primary" />
             {t.caseReport}
           </h1>
           <div className={`bg-m3-primaryContainer text-m3-primary px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest`}>
             {t[selectedClinic!]}
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-40">
           <div className="bg-white p-8 rounded-m3-xl shadow-soft border border-m3-outline/10 space-y-8">
              <div className="space-y-3">
                <h3 className="text-[11px] font-black text-m3-primary uppercase tracking-[0.3em]">{isRTL ? 'ملخص الحالة (غير تشخيصي)' : 'CASE SUMMARY (NON-DIAGNOSTIC)'}</h3>
                <p className="text-m3-onSurface text-[16px] font-semibold leading-relaxed italic border-l-4 border-m3-primary pl-6 py-2">"{report?.summary}"</p>
              </div>

              <div className="space-y-6">
                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-m3-onSurfaceVariant/50 uppercase tracking-[0.2em]">
                    <Target size={14} className="text-m3-primary" /> {isRTL ? 'أهداف سلوكية مقترحة' : 'BEHAVIORAL GOALS'}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {report?.behavioralGoals.map((goal, idx) => (
                      <div key={idx} className="bg-m3-surfaceVariant/50 p-4 rounded-2xl text-sm font-medium text-m3-onSurface">
                        {goal}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-m3-onSurfaceVariant/50 uppercase tracking-[0.2em]">
                    <Footprints size={14} className="text-m3-tertiary" /> {isRTL ? 'خطوات عملية يومية' : 'DAILY PRACTICAL STEPS'}
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {report?.practicalSteps.map((step, idx) => (
                      <div key={idx} className="bg-m3-primaryContainer/20 p-4 rounded-2xl text-sm font-medium text-m3-onSurface border border-m3-primary/5">
                        {step}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-m3-primary/5 p-6 rounded-3xl border border-m3-primary/10">
                  <h3 className="flex items-center gap-2 text-[10px] font-black text-m3-primary uppercase tracking-[0.2em] mb-3">
                    <ZapIcon size={14} /> {isRTL ? 'إستراتيجية المواجهة الأساسية' : 'PRIMARY STRATEGY'}
                  </h3>
                  <p className="text-[14px] text-m3-onSurface font-bold leading-relaxed">{report?.primaryStrategy}</p>
                </section>

                <div className="p-4 bg-m3-surface border border-m3-outline/10 rounded-2xl">
                   <p className="text-[10px] font-black text-m3-onSurfaceVariant/40 uppercase tracking-widest mb-1">{isRTL ? 'محور الجلسة القادمة' : 'NEXT SESSION FOCUS'}</p>
                   <p className="text-sm font-bold text-m3-onSurface">{report?.nextSessionFocus}</p>
                </div>
              </div>
           </div>

           <button 
             onClick={() => setStep('BOOKING')}
             className="w-full py-6 bg-m3-primary text-white rounded-m3-full font-bold text-xl shadow-premium active:scale-95 transition-all flex items-center justify-center gap-3"
           >
             <span>{t.bookWithSakinnah}</span>
             <ChevronRight size={24} className={isRTL ? 'rotate-180' : ''} />
           </button>
        </main>
      </div>
    );
  }

  if (step === 'BOOKING') {
    return (
      <BookingCalendar 
        onBack={() => setStep('REPORT')} 
        onConfirm={() => setStep('CHAT')} 
        language={language} 
        user={user} 
        onSubscribeRequired={() => {}} 
        categoryId={selectedClinic!} 
      />
    );
  }

  return (
    <ChatInterface 
      user={user} 
      category={{...category, id: (selectedClinic || 'THERAPY') as any}} 
      language={language} 
      onBack={onBack} 
      therapyMode={therapyMode}
    />
  );
};

export default TherapyFlow;
