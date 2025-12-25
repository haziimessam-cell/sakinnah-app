
import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { verificationService, TestResult } from '../services/verificationService';
import { 
  ShieldCheck, ArrowLeft, ArrowRight, Play, CheckCircle2, 
  XCircle, Loader2, FileDown, Sparkles, Activity 
} from 'lucide-react';
import { triggerHaptic, triggerSuccessHaptic } from '../services/hapticService';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
}

const VerificationSuite: React.FC<Props> = ({ user, language, onBack }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [report, setReport] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setResults([]);
    setReport(null);
    triggerHaptic();

    const testResults = await verificationService.runFullVerification(user, language);
    setResults(testResults);
    setReport(verificationService.generateTextReport(testResults));
    setIsRunning(false);
    triggerSuccessHaptic();
  };

  const handleExport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakinnah_verification_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-m3-background flex flex-col pt-safe pb-safe overflow-hidden animate-m3-fade-in">
      <header className="px-6 py-6 bg-white border-b border-m3-outline/5 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-m3-surfaceVariant rounded-xl transition-all">
            {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
          </button>
          <div>
            <h1 className="text-xl font-bold text-m3-onSurface">{t.diagnosticTitle}</h1>
            <p className="text-[10px] font-black text-m3-primary uppercase tracking-[0.2em]">Automated Verification Protocol</p>
          </div>
        </div>
        <button 
          onClick={handleRun}
          disabled={isRunning}
          className="p-3 bg-m3-primary text-white rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          {isRunning ? <Loader2 className="animate-spin" size={24} /> : <Play size={24} fill="currentColor" />}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
        <div className="bg-white p-8 rounded-[2.5rem] border border-m3-outline/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Activity size={120} /></div>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Sparkles className="text-m3-primary" size={20} />
                {t.runDiagnostic}
            </h2>
            <p className="text-sm text-m3-onSurfaceVariant/60 font-medium mb-6">
                {t.diagnosticDesc}
            </p>

            {!results.length && !isRunning && (
              <button 
                onClick={handleRun}
                className="w-full py-4 bg-m3-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-m3-primary/20 active:scale-95 transition-all"
              >
                <Activity size={20} />
                {t.runDiagnostic}
              </button>
            )}

            {isRunning && (
              <div className="py-12 flex flex-col items-center gap-4 animate-pulse">
                <Loader2 size={48} className="text-m3-primary animate-spin" />
                <p className="text-sm font-bold text-m3-primary">{t.diagnosticRunning}</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4 animate-m3-slide-up">
                {results.map((res) => (
                  <div key={res.id} className="p-5 bg-m3-surface border border-m3-outline/10 rounded-3xl flex items-start gap-4">
                    {res.status === 'passed' ? (
                      <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                    ) : (
                      <XCircle className="text-red-500 shrink-0" size={24} />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-m3-onSurface">{res.name}</h4>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${res.status === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {res.status === 'passed' ? t.testPassed : t.testFailed}
                        </span>
                      </div>
                      {res.details && <p className="text-xs text-m3-onSurfaceVariant/60 font-medium italic">{res.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {report && (
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <ShieldCheck className="text-m3-primary" size={18} />
                  {language === 'ar' ? 'تقرير التحقق النهائي' : 'Final Verification Report'}
                </h3>
                <button 
                  onClick={handleExport}
                  className="p-3 bg-white/10 text-white rounded-xl active:bg-white/20 transition-all"
                >
                  <FileDown size={20} />
                </button>
             </div>
             <pre className="text-[10px] font-mono text-emerald-400 bg-black/40 p-5 rounded-2xl overflow-x-auto border border-white/5 leading-relaxed">
               {report}
             </pre>
             <button 
                onClick={handleExport}
                className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
              >
                <FileDown size={20} />
                {t.exportReport}
              </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default VerificationSuite;
