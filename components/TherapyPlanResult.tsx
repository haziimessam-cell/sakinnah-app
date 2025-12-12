
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

  // --- 1. SCORING ENGINE ---
  const calculateScore = () => {
      let total = 0;
      answers.forEach(ans => {
          // Normalize string to avoid issues with hidden characters or spaces
          const cleanAns = ans.trim();
          
          if (cleanAns.includes('أبداً') || cleanAns.includes('Not at all')) total += 0;
          else if (cleanAns.includes('عدة أيام') || cleanAns.includes('Several days')) total += 1;
          else if (cleanAns.includes('أكثر من نصف') || cleanAns.includes('More than half')) total += 2;
          else if (cleanAns.includes('تقريباً كل يوم') || cleanAns.includes('Nearly every day')) total += 3;
      });
      return total;
  };

  // --- 2. DIAGNOSTIC LOGIC ---
  useEffect(() => {
      const score = calculateScore();
      // Assume 10 questions * 3 max points = 30 max score
      const maxScore = 30; 
      
      let severity: Severity = 'minimal';
      
      // Standard GAD-7 / PHQ-9 Cutoffs:
      // 0-4: Minimal
      // 5-9: Mild
      // 10-14: Moderate
      // 15+: Severe
      if (score <= 4) severity = 'minimal';
      else if (score <= 9) severity = 'mild';
      else if (score <= 14) severity = 'moderate';
      else severity = 'severe';

      const diagnosis = getDiagnosisContent(category.id, severity, score, maxScore);
      setResult(diagnosis);
  }, [category, answers]);

  // --- 3. CLINICAL CONTENT DATABASE ---
  const getDiagnosisContent = (catId: string, severity: Severity, score: number, maxScore: number): DiagnosisResult => {
      
      let base: DiagnosisResult = {
          score, maxScore, severity,
          clinicalTitleAr: 'تقييم الصحة النفسية العام',
          clinicalTitleEn: 'General Mental Health Assessment',
          descriptionAr: 'تظهر النتائج بعض التحديات التي يمكن التعامل معها بوعي.',
          descriptionEn: 'Results show some challenges that can be managed with awareness.',
          reassuranceAr: 'أنت لست وحدك، وهذا الشعور مؤقت.',
          reassuranceEn: 'You are not alone, and this feeling is temporary.',
          color: 'text-gray-600'
      };

      // DEPRESSION (PHQ-9)
      if (catId === 'depression') {
          if (severity === 'minimal') {
              base.clinicalTitleAr = 'أعراض عابرة (لا يوجد اكتئاب)';
              base.clinicalTitleEn = 'Minimal Symptoms (No Depression)';
              base.descriptionAr = 'المزاج ضمن النطاق الطبيعي. التقلبات الحالية استجابة طبيعية للحياة.';
              base.descriptionEn = 'Mood is within normal range. Current fluctuations are natural life responses.';
              base.reassuranceAr = 'أنت بخير. حافظ على نمط حياتك الصحي.';
              base.reassuranceEn = 'You are doing well. Maintain your healthy lifestyle.';
              base.color = 'text-green-600';
          } else if (severity === 'mild') {
              base.clinicalTitleAr = 'نوبة اكتئاب خفيفة';
              base.clinicalTitleEn = 'Mild Depressive Episode';
              base.descriptionAr = 'انخفاض طفيف في الطاقة والمزاج، لكن القدرة على العمل ما زالت موجودة.';
              base.descriptionEn = 'Slight drop in energy/mood, but functioning remains intact.';
              base.reassuranceAr = 'هذه غيمة ستمر. الحديث والرياضة كفيلان بتبديدها.';
              base.reassuranceEn = 'This cloud will pass. Talking and exercise can clear it.';
              base.color = 'text-yellow-600';
          } else if (severity === 'moderate') {
              base.clinicalTitleAr = 'اكتئاب متوسط الشدة';
              base.clinicalTitleEn = 'Moderate Depression';
              base.descriptionAr = 'تأثر واضح في النوم والشهية والتركيز. الحياة تتطلب جهداً مضاعفاً.';
              base.descriptionEn = 'Sleep, appetite, and focus affected. Life feels like double effort.';
              base.reassuranceAr = 'ألمك حقيقي وله أسباب بيولوجية. أنت تستحق المساعدة لتخفيف هذا الحمل.';
              base.reassuranceEn = 'Your pain is real and biological. You deserve help to lighten this load.';
              base.color = 'text-orange-600';
          } else {
              base.clinicalTitleAr = 'اكتئاب جسيم (Major Depression)';
              base.clinicalTitleEn = 'Severe Major Depression';
              base.descriptionAr = 'سيطرة تامة لمشاعر الحزن وانعدام الشغف، مع تأثير قوي على الوظائف.';
              base.descriptionEn = 'Total dominance of sadness/anhedonia, strongly impacting function.';
              base.reassuranceAr = 'هذا "مرض" قابل للشفاء وليس "ضعفاً" فيك. الأدوية والجلسات ستعيد لك توازنك.';
              base.reassuranceEn = 'This is a treatable illness, not a weakness. Meds and therapy will restore balance.';
              base.color = 'text-red-600';
          }
      } 
      
      // ANXIETY (GAD-7)
      else if (catId === 'anxiety') {
          if (severity === 'severe') {
              base.clinicalTitleAr = 'قلق عام شديد (GAD)';
              base.clinicalTitleEn = 'Severe GAD';
              base.descriptionAr = 'الجهاز العصبي في حالة طوارئ مستمرة (Fight or Flight).';
              base.descriptionEn = 'Nervous system in constant Fight or Flight mode.';
              base.reassuranceAr = 'جسمك يحميك بزيادة، لكن "جرس الإنذار" عالق. سنساعدك على إطفائه.';
              base.reassuranceEn = 'Your body is over-protecting you. We will help reset the alarm.';
              base.color = 'text-red-600';
          } else if (severity === 'moderate') {
              base.clinicalTitleAr = 'قلق متوسط';
              base.clinicalTitleEn = 'Moderate Anxiety';
              base.descriptionAr = 'توتر عضلي وأفكار متسارعة يصعب السيطرة عليها.';
              base.descriptionEn = 'Muscle tension and racing thoughts hard to control.';
              base.reassuranceAr = 'القلق كاذب محترف. سنعلمك كيف تكشف خدعه وتسترخي.';
              base.reassuranceEn = 'Anxiety is a liar. We will teach you to spot its tricks and relax.';
              base.color = 'text-orange-600';
          } else {
              base.clinicalTitleAr = 'قلق بسيط';
              base.clinicalTitleEn = 'Mild Anxiety';
              base.descriptionAr = 'قلق ظرفي مرتبط بضغوط حالية.';
              base.descriptionEn = 'Situational anxiety related to current stressors.';
              base.reassuranceAr = 'قليل من القلق دافع للإنجاز. تنفس بعمق، أنت مسيطر.';
              base.reassuranceEn = 'A little anxiety drives success. Breathe, you are in control.';
              base.color = 'text-yellow-600';
          }
      }

      return base;
  };

  const getSessionsCount = () => {
      if (!result) return 1;
      if (result.severity === 'severe') return 3;
      if (result.severity === 'moderate') return 2;
      return 1;
  };

  const getIntensityPercentage = () => {
      if (!result) return 0;
      return (result.score / result.maxScore) * 100;
  };

  if (!result) return <div className="p-10 text-center">Loading Assessment...</div>;

  return (
    <div className="h-full flex flex-col pt-safe pb-safe bg-gradient-to-b from-indigo-50 via-white to-white animate-fadeIn overflow-y-auto no-scrollbar">
        
        {/* Diagnosis Header Card */}
        <div className="p-6 pb-2">
            <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-white/50 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${result.severity === 'severe' ? 'bg-red-500' : result.severity === 'moderate' ? 'bg-orange-500' : result.severity === 'mild' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Activity size={12} />
                            {language === 'ar' ? 'التشخيص المبدئي' : 'Clinical Impression'}
                        </h2>
                        <h1 className={`text-xl md:text-2xl font-black ${result.color} leading-tight`}>
                            {language === 'ar' ? result.clinicalTitleAr : result.clinicalTitleEn}
                        </h1>
                    </div>
                    <div className={`flex flex-col items-center justify-center`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${result.severity === 'severe' ? 'bg-red-500' : result.severity === 'moderate' ? 'bg-orange-500' : result.severity === 'mild' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                            {result.score}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 font-mono">/ {result.maxScore}</span>
                    </div>
                </div>

                {/* Score Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-medium">
                        <span>Min</span>
                        <span>Severity Scale</span>
                        <span>Max</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${result.severity === 'severe' ? 'bg-red-500' : result.severity === 'moderate' ? 'bg-orange-500' : result.severity === 'mild' ? 'bg-yellow-500' : 'bg-green-500'}`} 
                            style={{ width: `${getIntensityPercentage()}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <Info size={20} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                        {language === 'ar' ? result.descriptionAr : result.descriptionEn}
                    </p>
                </div>
            </div>
        </div>

        {/* Reassurance Message (The "Containment" Card) */}
        <div className="px-6 py-2">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 shadow-lg shadow-indigo-500/30 text-white relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="flex items-center gap-3 mb-3">
                    <HeartHandshake size={24} className="text-pink-300" />
                    <h3 className="font-bold text-indigo-100 text-sm uppercase tracking-wide">
                        {language === 'ar' ? 'رسالة طمأنة' : 'Reassurance'}
                    </h3>
                </div>
                
                <p className="text-lg font-medium leading-relaxed opacity-95">
                    "{language === 'ar' ? result.reassuranceAr : result.reassuranceEn}"
                </p>
                
                <div className="mt-4 flex items-center gap-2 text-xs text-indigo-200 bg-black/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                    <ShieldCheck size={12} />
                    <span>{language === 'ar' ? 'بياناتك آمنة وسرية تماماً' : 'Your data is strictly private'}</span>
                </div>
            </div>
        </div>

        {/* Action Plan */}
        <div className="p-6 pt-2 pb-10 flex-1 flex flex-col justify-end">
            <div className="mb-6">
                <h3 className="text-gray-900 font-bold mb-3 px-2 flex items-center gap-2">
                    <BarChart3 size={18} className="text-gray-500" />
                    {language === 'ar' ? 'الخطة المقترحة' : 'Recommended Plan'}
                </h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium">{language === 'ar' ? 'عدد الجلسات' : 'Sessions'}</div>
                        <div className="text-lg font-bold text-gray-800">
                            {getSessionsCount()} {t.sessionsPerWeek}
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium">{language === 'ar' ? 'المدة' : 'Duration'}</div>
                        <div className="text-lg font-bold text-gray-800">45 {t.minutes}</div>
                    </div>
                </div>
            </div>

            <button 
                onClick={onBookSession}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl shadow-gray-900/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
                <Calendar size={20} className="text-gray-300" />
                <span>{t.bookSession}</span>
                {isRTL ? <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> : <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </button>
        </div>

    </div>
  );
};

export default TherapyPlanResult;
