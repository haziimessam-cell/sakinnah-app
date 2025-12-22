
import React, { useEffect, useState } from 'react';
import { Category, Language } from '../types';
import { translations } from '../translations';
import { 
  Calendar, Activity, ShieldCheck, ArrowRight, BrainCircuit, Microscope, BookOpenCheck 
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
      <div className="p-8">
        {/* Clinical Summary Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-2xl mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20"></div>
            <div className="flex items-center gap-3 mb-6">
                <BookOpenCheck size={28} className="text-blue-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">{isRTL ? 'التقييم العلمي المعتمد' : 'SCIENTIFIC ASSESSMENT'}</span>
            </div>
            <h2 className="text-3xl font-black mb-4 leading-tight italic">{isRTL ? 'خطة العناية المقترحة' : 'Care Plan Proposal'}</h2>
            <p className="text-sm text-blue-100/80 leading-relaxed font-medium">
                {isRTL 
                  ? 'تم تحليل استجاباتك للعشرة أسئلة بدقة لتحديد ملامح المسار العلاجي الأنسب لك.' 
                  : 'Your responses to the ten questions have been meticulously analyzed to define your ideal therapeutic track.'}
            </p>
        </div>

        {/* Clinical Rationale Section */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 mb-10 relative group">
          <h3 className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-[0.3em] mb-8">
            <Microscope size={22} className="text-primary-600" />
            {isRTL ? 'بصيرة سكينة (تحليل الحالة)' : 'SAKINNAH INSIGHT (CASE ANALYSIS)'}
          </h3>
          
          {loadingRationale ? (
            <div className="flex flex-col items-center py-12 space-y-6">
              <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em]">{isRTL ? 'جاري استخلاص النتائج السريرية...' : 'EXTRACTING CLINICAL RESULTS...'}</p>
            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100 italic">
              <p className="text-base leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
                {rationale}
              </p>
              <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200 text-[10px] font-black text-primary-500 uppercase tracking-widest">
                  <BrainCircuit size={16} /> {isRTL ? 'مدعوم بذكاء اصطناعي إكلينيكي' : 'POWERED BY CLINICAL AI'}
              </div>
            </div>
          )}
        </div>

        {/* Action Call */}
        <div className="space-y-6">
            <h3 className="text-slate-800 font-black text-[11px] uppercase tracking-[0.4em] px-4">{isRTL ? 'الخطوة التالية' : 'NEXT STEP'}</h3>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8 mb-8">
                <p className="text-sm text-emerald-800 font-bold leading-relaxed">
                    {isRTL 
                      ? 'بناءً على التقييم، ننصح بجدولة جلسة حوارية أولى لبدء العمل على نقاط القوة وتجاوز التحديات.' 
                      : 'Based on the assessment, we recommend scheduling your first session to work on strengths and overcome challenges.'}
                </p>
            </div>
            
            <button 
              onClick={onBookSession}
              className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all group"
            >
              <Calendar size={28} className="text-primary-400 group-hover:scale-110 transition-transform" />
              <span>{isRTL ? 'تحديد موعد الجلسة' : 'Schedule Session'}</span>
              <ArrowRight size={24} className={isRTL ? 'rotate-180' : ''} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default TherapyPlanResult;
