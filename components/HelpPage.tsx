
import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, ChevronDown, MessageCircle, Mail } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface Props {
  onBack: () => void;
  language: Language;
}

const FAQ_ITEMS_AR = [
    { q: "هل تطبيق سكينة بديل للطبيب النفسي؟", a: "لا، سكينة هو أداة مساعدة للدعم النفسي والتوجيه المبني على أسس علمية." },
    { q: "هل محادثاتي سرية؟", a: "نعم، جميع المحادثات يتم تخزينها محلياً على جهازك." }
];

const FAQ_ITEMS_EN = [
    { q: "Is Sakinnah a substitute for a doctor?", a: "No, it is a supportive tool based on scientific principles but not a replacement for professional help." },
    { q: "Are my chats private?", a: "Yes, all conversations are stored locally on your device." }
];

const HelpPage: React.FC<Props> = ({ onBack, language }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = language === 'ar' ? FAQ_ITEMS_AR : FAQ_ITEMS_EN;

  return (
    <div className="h-full bg-transparent flex flex-col pt-safe pb-safe animate-fadeIn">
      <header className="bg-white/40 backdrop-blur-xl px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-3 border-b border-white/20">
         <button onClick={onBack} className="p-2 hover:bg-white/60 rounded-full transition-colors border border-transparent hover:border-white/40">
             {isRTL ? <ArrowRight size={24} className="text-gray-600" /> : <ArrowLeft size={24} className="text-gray-600" />}
         </button>
         <h1 className="text-xl font-bold text-gray-900">{t.helpTitle}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
          <div className="bg-primary-600/90 backdrop-blur-md rounded-2xl p-6 text-white text-center shadow-lg border border-primary-500/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <h2 className="text-xl font-bold mb-2 relative z-10">{t.howToHelp}</h2>
              <p className="text-primary-100 text-sm mb-6 relative z-10">{t.communitySupport}</p>
              <div className="flex gap-3 justify-center relative z-10">
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors border border-white/20">
                      <MessageCircle size={16} /> {t.chatSupport}
                  </button>
                  <button className="bg-white text-primary-600 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                      <Mail size={16} /> {t.emailUs}
                  </button>
              </div>
          </div>

          <div>
              <h3 className="font-bold text-gray-800 mb-4 px-1">{t.faq}</h3>
              <div className="space-y-3">
                  {items.map((item, i) => (
                      <div key={i} className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 overflow-hidden shadow-sm hover:bg-white/80 transition-all">
                          <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 text-start">
                              <span className="font-bold text-gray-700 text-sm">{item.q}</span>
                              <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
                          </button>
                          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                              <div className="p-4 pt-0 text-sm text-gray-500 leading-relaxed border-t border-gray-100/50 mt-2">{item.a}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </main>
    </div>
  );
};

export default HelpPage;
