
import React, { useEffect, useState } from 'react';
import { Category, Language } from '../types';
import { translations } from '../translations';
import { CheckCircle2, Calendar, Activity, HeartHandshake, ShieldCheck, ArrowRight, ArrowLeft, BarChart3, Info } from 'lucide-react';

interface Props {
  category: Category;
  language: Language;
  answers: string[]; // Answers from assessment
  onBookSession: () => void;
}

// Clinical Types
type Severity = 'minimal' | 'mild' | 'moderate' | 'severe';

interface DiagnosisResult {
  score: number;
  maxScore: number;
  severity: Severity;
  clinicalTitleAr: string;
  clinicalTitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  reassuranceAr: string;
  reassuranceEn: string;
  color: string;
}

const TherapyPlanResult: React.FC<Props> = ({ category, language, answers, onBookSession }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const calculateScore = () => {
      let total = 0;
      answers.forEach(ans => {
          const cleanAns = ans.trim();
          if (cleanAns.includes('أبداً') || cleanAns.includes('Not at all')) total += 0;
          else if (cleanAns.includes('عدة أيام') || cleanAns.includes('Several days')) total += 1;
          else if (cleanAns.includes('أكثر من نصف') || cleanAns.includes('More than half')) total += 2;
          else if (cleanAns.includes('تقريباً كل يوم') || cleanAns.includes('Nearly every day')) total += 3;
      });
      return total;
  };

  useEffect(() => {
      const score = calculateScore();
      const maxScore = answers.length * 3; 
      
      let severity: Severity = 'minimal';
      if (score <= maxScore * 0.2) severity = 'minimal';
      else if (score <= maxScore * 0.45) severity = 'mild';
      else if (score <= maxScore * 0.7) severity = 'moderate';
      else severity = 'severe';

      const diagnosis = getDiagnosisContent(category.id, severity, score, maxScore);
      setResult(diagnosis);
  }, [category, answers]);

  const getDiagnosisContent = (catId: string, severity: Severity, score: number, maxScore: number): DiagnosisResult => {
      let base: DiagnosisResult = {
          score, maxScore, severity,
          clinicalTitleAr: 'تقييم الصحة النفسية',
          clinicalTitleEn: 'Mental Health Assessment',
          descriptionAr: 'تظهر النتائج بعض التحديات التي يمكن التعامل معها بوعي.',
          descriptionEn: 'Results show some challenges that can be managed with awareness.',
          reassuranceAr: 'أنت لست وحدك، وهذا الشعور مؤقت.',
          reassuranceEn: 'You are not alone, and this feeling is temporary.',
          color: 'text-gray-600'
      };

      if (catId === 'depression') {
          base.clinicalTitleAr = severity === 'severe' ? 'اكتئاب جسيم' : severity === 'moderate' ? 'اكتئاب متوسط' : 'أعراض اكتئاب خفيفة';
          base.clinicalTitleEn = severity === 'severe' ? 'Major Depression' : severity === 'moderate' ? 'Moderate Depression' : 'Mild Depression';
          base.color = severity === 'severe' ? 'text-red-600' : 'text-orange-600';
      } else if (catId === 'anxiety') {
          base.clinicalTitleAr = severity === 'severe' ? 'قلق عام شديد' : 'قلق بسيط إلى متوسط';
          base.clinicalTitleEn = severity === 'severe' ? 'Severe Anxiety' : 'Mild to Moderate Anxiety';
          base.color = severity === 'severe' ? 'text-red-600' : 'text-teal-600';
      } else if (catId === 'ocd') {
          base.clinicalTitleAr = 'تقييم الوسواس القهري';
          base.clinicalTitleEn = 'OCD Evaluation';
          base.descriptionAr = 'الأفكار المتكررة هي نتاج كيمياء الدماغ وليست حقيقتك.';
          base.descriptionEn = 'Repetitive thoughts are brain chemistry, not your reality.';
          base.color = 'text-purple-600';
      } else if (catId === 'baraem') {
          base.clinicalTitleAr = 'تقرير نمو الطفل النفسي';
          base.clinicalTitleEn = 'Child Psychological Report';
          base.descriptionAr = 'الطفل يمر بمرحلة نمو تتطلب احتواءً خاصاً وتوجيهاً سلوكياً.';
          base.descriptionEn = 'The child is in a developmental stage requiring special containment.';
          base.color = 'text-lime-600';
      } else if (catId === 'relationships') {
          base.clinicalTitleAr = 'تحليل التوافق العاطفي';
          base.clinicalTitleEn = 'Relational Compatibility Analysis';
          base.descriptionAr = 'العلاقات تمر بمنعطفات تتطلب مهارات تواصل جديدة.';
          base.descriptionEn = 'Relationships face turns that require new communication skills.';
          base.color = 'text-rose-600';
      }

      return base;
  };

  const getSessionsCount = (s: Severity) => (s === 'severe' ? 3 : s === 'moderate' ? 2 : 1);
  const getSessionDuration = (s: Severity) => (s === 'minimal' || s === 'mild' ? 30 : 45);

  if (!result) return null;

  return (
    <div className="h-full flex flex-col pt-safe pb-safe bg-gradient-to-b from-indigo-50 via-white to-white animate-fadeIn overflow-y-auto no-scrollbar">
        <div className="p-6 pb-2">
            <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-white/50 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${result.severity === 'severe' ? 'bg-red-500' : result.severity === 'moderate' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Activity size={12} /> {isRTL ? 'النتيجة الإكلينيكية' : 'Clinical Result'}</h2>
                        <h1 className={`text-xl font-black ${result.color}`}>{isRTL ? result.clinicalTitleAr : result.clinicalTitleEn}</h1>
                    </div>
                    <div className="text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-gray-800`}>{result.score}</div>
                        <span className="text-[10px] text-gray-400 font-mono">/ {result.maxScore}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{isRTL ? result.descriptionAr : result.descriptionEn}</p>
            </div>
        </div>

        <div className="px-6 py-2">
            <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg">
                <h3 className="font-bold text-sm mb-2 opacity-80">{isRTL ? 'توجيه سكينة' : 'Sakinnah Guidance'}</h3>
                <p className="text-lg font-medium">"{isRTL ? result.reassuranceAr : result.reassuranceEn}"</p>
            </div>
        </div>

        <div className="p-6 pt-2 flex-1 flex flex-col justify-end">
            <h3 className="text-gray-900 font-bold mb-3 px-2 flex items-center gap-2"><BarChart3 size={18} /> {isRTL ? 'الخطة المقترحة' : 'Action Plan'}</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between mb-6 shadow-sm">
                <div>
                    <div className="text-xs text-gray-500 mb-1">{isRTL ? 'الجلسات' : 'Sessions'}</div>
                    <div className="text-lg font-bold text-gray-800">{getSessionsCount(result.severity)} {t.sessionsPerWeek}</div>
                </div>
                <div className="h-8 w-px bg-gray-200"></div>
                <div>
                    <div className="text-xs text-gray-500 mb-1">{isRTL ? 'المدة' : 'Duration'}</div>
                    <div className="text-lg font-bold text-gray-800">{getSessionDuration(result.severity)} {t.minutes}</div>
                </div>
            </div>

            <button onClick={onBookSession} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                <Calendar size={20} />
                <span>{t.bookSession}</span>
                {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
            </button>
        </div>
    </div>
  );
};

export default TherapyPlanResult;
