
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { generateContent } from '../services/geminiService';
import { EMPATHY_TRANSLATOR_PROMPT } from '../constants';
import { Send, Sparkles, RefreshCw, ArrowLeft, ArrowRight, MessageSquare, Quote } from 'lucide-react';

interface Props {
  language: Language;
  onBack: () => void;
}

const EmpathyTranslator: React.FC<Props> = ({ language, onBack }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await generateContent(`Translate this aggressive statement into Non-Violent Communication (Feelings + Needs): "${input}"`, EMPATHY_TRANSLATOR_PROMPT);
      setResult(res || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-indigo-50/30 flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden">
      <header className="px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-indigo-100 flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
          {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
        </button>
        <h1 className="font-bold text-indigo-900">{t.rel_tool_translator}</h1>
      </header>

      <main className="flex-1 p-6 space-y-6 overflow-y-auto no-scrollbar">
        <div className="bg-white/80 rounded-[2.5rem] p-6 shadow-sm border border-indigo-50">
          <label className="text-[10px] font-black uppercase text-indigo-400 mb-3 block tracking-widest">{isRTL ? 'الجملة الأصلية (لحظة الغضب)' : 'Original Statement'}</label>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-indigo-50/50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-200 outline-none h-32 resize-none placeholder-indigo-300"
            placeholder={t.rel_translator_placeholder}
          />
          <button 
            onClick={handleTranslate}
            disabled={loading || !input.trim()}
            className="w-full mt-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <Sparkles size={20} />}
            <span>{isRTL ? 'إعادة صياغة عاطفية' : 'Rephrase with Empathy'}</span>
          </button>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden animate-slideUp">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Quote size={64} /></div>
            <h3 className="text-indigo-300 font-bold mb-4 flex items-center gap-2">
              <MessageSquare size={18} />
              {t.rel_translator_result}
            </h3>
            <p className="text-lg font-medium leading-relaxed italic">"{result}"</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default EmpathyTranslator;
