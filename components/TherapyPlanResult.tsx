
import React, { useEffect, useState } from 'react';
import { Category, Language } from '../types';
import { translations } from '../translations';
import { 
  Calendar, Activity, ShieldCheck, ArrowRight, BrainCircuit, Microscope, BookOpenCheck, Info 
} from 'lucide-react';
import { generateClinicalRationale } from '../services/geminiService';

interface Props {
  category: Category;
  language: Language;
  answers: string[];
  onBookSession: () => void;
}

const TherapyPlanResult: React.FC<Props> = ({ category, language, answers, onBookSession }) => {
  const isRTL = language === 'ar';
  const [rationale, setRationale] = useState<string>('');
  const [loadingRationale, setLoadingRationale] = useState(false);

  useEffect(() => {
    const fetchRationale = async () => {
      setLoadingRationale(true);
      try {
        const result = await generateClinicalRationale(category.id, answers, language);
        setRationale(result || '');
      } catch (e) {
        setRationale(isRTL ? 'فشل تحليل المنطق السريري.' : 'Clinical rationale analysis failed.');
      } finally {
        setLoadingRationale(false);
      }
    };
    fetchRationale();
  }, [category.id, answers, language]);

  return (
    <div className="h-full flex flex-col pt-safe pb-safe bg-[#FDFCFB] animate-fadeIn overflow-y-auto no-scrollbar">
      <div className="p-6">
        {/* ملخص الخطة */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center gap-3 mb-4">
                <BookOpenCheck size={24} className="text-blue-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isRTL ? 'المسار العلمي المعتمد' : 'SCIENTIFIC TRACK'}</span>
            </div>
            <h2 className="text-2xl font-black mb-2">{isRTL ? 'بروتوكول العلاج المعرفي' : 'CBT Protocol'}</h2>
            <p className="text-xs text-blue-100/80 leading-relaxed font-medium">
                {isRTL 
                  ? 'تم تخصيص هذا المسار بناءً على أنماط استجابتك ومطابقتها مع المعايير الإكلينيكية.' 
                  : 'This track has been customized based on your response patterns and clinical alignment.'}
            </p>
        </div>

        {/* بصيرة سكينة: المنطق السريري */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-8 relative group">
          <h3 className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest mb-6">
            <Microscope size={18} className="text-primary-600" />
            {isRTL ? 'بصيرة سكينة (المنطق الإكلينيكي)' : 'SAKINNAH INSIGHT (CLINICAL RATIONALE)'}
          </h3>
          
          {loadingRationale ? (
            <div className="flex flex-col items-center py-10 space-y-4">
              <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-slate-400 font-bold animate-pulse uppercase tracking-widest">{isRTL ? 'جاري تحليل الأنماط المنطقية...' : 'ANALYZING LOGICAL PATTERNS...'}</p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap italic">
                {rationale}
              </div>
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200 text-[10px] font-black text-primary-500 uppercase">
                  <BrainCircuit size={14} /> {isRTL ? 'تحليل مدعوم بالذكاء الاصطناعي المعمق' : 'AI-POWERED DEEP REASONING'}
              </div>
            </div>
          )}
        </div>

        {/* الخطوات */}
        <div className="space-y-4 mb-10">
          <h3 className="text-slate-800 font-black text-xs uppercase tracking-widest px-2 mb-4">{isRTL ? 'الخطوات التنفيذية' : 'ACTIONABLE STEPS'}</h3>
          {[
            { icon: <Activity />, titleAr: 'تحدي الأفكار التلقائية', titleEn: 'Challenging Thoughts', descAr: 'تحديد التشوهات المعرفية التي تم رصدها.' },
            { icon: <ShieldCheck />, titleAr: 'بناء المرونة السلوكية', titleEn: 'Building Resilience', descAr: 'تمارين تدريجية بناءً على شدة الحالة.' }
          ].map((step, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0">{step.icon}</div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{isRTL ? step.titleAr : step.titleEn}</h4>
                <p className="text-xs text-slate-400 mt-1">{isRTL ? step.descAr : step.descAr}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={onBookSession}
          className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group"
        >
          <Calendar size={22} className="text-primary-400" />
          <span>{isRTL ? 'بدء الجلسة الأولى' : 'Start First Session'}</span>
          <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
        </button>
      </div>
    </div>
  );
};

export default TherapyPlanResult;
