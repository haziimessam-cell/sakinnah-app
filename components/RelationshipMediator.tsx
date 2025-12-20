
import React, { useState, useEffect } from 'react';
import { Language, User } from '../types';
import { mediateDialogue, initializeMediator } from '../services/geminiService';
import { Heart, ShieldAlert, Sparkles, MessageCircle, ArrowRight, ArrowLeft, RefreshCw, Wind } from 'lucide-react';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
  onTriggerBreathing: () => void;
}

const RelationshipMediator: React.FC<Props> = ({ user, language, onBack, onTriggerBreathing }) => {
  const isRTL = language === 'ar';
  const [inputs, setInputs] = useState({ partnerA: '', partnerB: '' });
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [tensionLevel, setTensionLevel] = useState(0);

  useEffect(() => {
    initializeMediator(language);
  }, [language]);

  const handleMediate = async () => {
    if (!inputs.partnerA || !inputs.partnerB) return;
    setLoading(true);
    try {
      const result = await mediateDialogue(inputs.partnerA, inputs.partnerB, language);
      setAnalysis(result || '');
      // محاكاة اكتشاف التوتر من النص (بشكل بسيط للعرض)
      if (result?.includes('نقد') || result?.includes('Criticism')) setTensionLevel(80);
      else setTensionLevel(30);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-rose-50/30 flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden">
      <header className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-rose-100 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-rose-50 rounded-xl transition-all">
            {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
          </button>
          <h1 className="font-bold text-rose-800">{isRTL ? 'الوسيط الذكي' : 'AI Mediator'}</h1>
        </div>
        {tensionLevel > 50 && (
          <button onClick={onTriggerBreathing} className="p-2 bg-rose-500 text-white rounded-full animate-pulse">
            <Wind size={20} />
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 border border-rose-100 shadow-sm space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-rose-400 mb-2 block">{isRTL ? 'وجهة نظر الطرف الأول' : "Partner A's View"}</label>
            <textarea 
              value={inputs.partnerA}
              onChange={(e) => setInputs({...inputs, partnerA: e.target.value})}
              className="w-full bg-white border border-rose-50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-rose-200 outline-none h-24 resize-none"
              placeholder={isRTL ? "ماذا تشعر؟" : "How do you feel?"}
            />
          </div>
          <div className="flex justify-center"><Heart className="text-rose-200 animate-pulse" /></div>
          <div>
            <label className="text-[10px] font-black uppercase text-rose-400 mb-2 block">{isRTL ? 'وجهة نظر الطرف الثاني' : "Partner B's View"}</label>
            <textarea 
              value={inputs.partnerB}
              onChange={(e) => setInputs({...inputs, partnerB: e.target.value})}
              className="w-full bg-white border border-rose-50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-rose-200 outline-none h-24 resize-none"
              placeholder={isRTL ? "بماذا ترد؟" : "How do you respond?"}
            />
          </div>
          <button 
            onClick={handleMediate}
            disabled={loading}
            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={20} />}
            <span>{isRTL ? 'تحليل الموقف' : 'Analyze Dynamics'}</span>
          </button>
        </div>

        {analysis && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 border border-rose-200 shadow-xl animate-slideUp">
            <h3 className="flex items-center gap-2 text-rose-600 font-bold mb-4">
              <ShieldAlert size={18} />
              {isRTL ? 'بصيرة سكينة' : 'Sakinnah Insight'}
            </h3>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
              {analysis}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RelationshipMediator;
