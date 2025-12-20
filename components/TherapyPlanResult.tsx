
import React, { useEffect, useState } from 'react';
import { Category, Language } from '../types';
import { translations } from '../translations';
import { 
  CheckCircle2, Calendar, Activity, ShieldCheck, ArrowRight, ArrowLeft, 
  BarChart3, HeartPulse, BrainCircuit, Zap, AlertTriangle, TrendingUp, Info, Microscope, BookOpenCheck 
} from 'lucide-react';
import { generateClinicalAnalysis } from '../services/geminiService';

interface Props {
  category: Category;
  language: Language;
  answers: string[];
  onBookSession: () => void;
}

const TherapyPlanResult: React.FC<Props> = ({ category, language, answers, onBookSession }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [clinicalRationale, setClinicalRationale] = useState<string>('');
  const [loadingRationale, setLoadingRationale] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoadingRationale(true);
      try {
        const result = await generateClinicalAnalysis(category.id, answers, language);
        setClinicalRationale(result || '');
      } catch (e) {
        setClinicalRationale(isRTL ? 'فشل جلب التحليل السريري المعمق.' : 'Clinical rationale generation failed.');
      } finally {
        setLoadingRationale(false);
      }
    };
    fetchAnalysis();
  }, [category.id, answers, language]);

  const getScientificProtocol = () => {
    switch(category.id) {
        case 'depression': return isRTL ? 'تنشيط سلوكي (BA)' : 'Behavioral Activation (BA)';
        case 'anxiety': return isRTL ? 'يقظة ذهنية وعلاج معرفي' : 'Mindfulness & CBT';
        case 'ocd': return isRTL ? 'تعرض ومنع استجابة (ERP)' : 'Exposure & Response Prevention (ERP)';
        case 'relationships': return isRTL ? 'منهجية غوتمان للذكاء العاطفي' : 'Gottman Method';
        case 'bipolar': return isRTL ? 'تنظيم الإيقاع الاجتماعي (IPSRT)' : 'IPSRT Protocol';
        default: return isRTL ? 'علاج معرفي سلوكي (CBT)' : 'Standard CBT';
    }
  };

  return (
    <div className="h-full flex flex-col pt-safe pb-safe bg-[#FDFCFB] animate-fadeIn overflow-y-auto no-scrollbar">
      <div className="p-6">
        {/* بطاقة البروتوكول العلمي */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center gap-3 mb-4">
                <BookOpenCheck size={24} className="text-blue-200" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isRTL ? 'البروتوكول العلمي المعتمد' : 'APPROVED SCIENTIFIC PROTOCOL'}</span>
            </div>
            <h2 className="text-2xl font-black mb-2">{getScientificProtocol()}</h2>
            <p className="text-xs text-blue-100/80 leading-relaxed">
                {isRTL 
                  ? 'تم تخصيص هذا المسار بناءً على تحليل استجاباتك ومطابقتها مع أحدث الأدلة العلمية في الصحة النفسية.' 
                  : 'This path has been customized based on your responses and their alignment with the latest evidence in mental health.'}
            </p>
        </div>

        {/* قسم المنطق السريري */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 mb-8 relative group">
          <h3 className="flex items-center gap-2 text-slate-800 font-black text-xs uppercase tracking-widest mb-6">
            <Microscope size={18} className="text-indigo-600" />
            {isRTL ? 'التحليل الإكلينيكي (بصيرة سكينة)' : 'CLINICAL RATIONALE (SAKINNAH INSIGHT)'}
          </h3>
          
          {loadingRationale ? (
            <div className="flex flex-col items-center py-10 space-y-4">
              <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] text-slate-400 font-bold animate-pulse uppercase tracking-widest">{isRTL ? 'جاري مطابقة الأعراض سيكولوجياً...' : 'MATCHING SYMPTOMS PSYCHOLOGICALLY...'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-wrap italic">
                {clinicalRationale}
              </div>
            </div>
          )}
        </div>

        {/* الخطة الإجرائية */}
        <div className="space-y-4 mb-10">
          <h3 className="text-slate-800 font-black text-xs uppercase tracking-widest px-2 mb-4">{isRTL ? 'الخطوات التنفيذية' : 'ACTIONABLE STEPS'}</h3>
          {[
            { icon: <TrendingUp />, titleAr: 'مراقبة المحفزات', titleEn: 'Trigger Monitoring', descAr: 'تحديد المواقف التي تثير الأعراض لديك.' },
            { icon: <BrainCircuit />, titleAr: 'تحدي الأفكار التلقائية', titleEn: 'Cognitive Reframing', descAr: 'إعادة صياغة التفسيرات السلبية للأحداث.' },
            { icon: <ShieldCheck />, titleAr: 'بناء المرونة العصبية', titleEn: 'Neuroplasticity Work', descAr: 'تمارين يومية لتقوية المسارات الدماغية الإيجابية.' }
          ].map((step, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">{step.icon}</div>
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
          <Calendar size={22} className="text-indigo-400" />
          <span>{isRTL ? 'بدء البرنامج العلاجي' : 'Start Therapy Program'}</span>
          <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
        </button>
      </div>
    </div>
  );
};

export default TherapyPlanResult;
