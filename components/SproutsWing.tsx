
import React from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { ArrowLeft, ArrowRight, Sprout, ShieldCheck, HeartPulse } from 'lucide-react';

interface Props {
  user: User;
  language: Language;
  onBack: () => void;
}

const SproutsWing: React.FC<Props> = ({ user, language, onBack }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';

  return (
    <div className="h-full bg-teal-50 flex flex-col pt-safe pb-safe animate-m3-fade-in overflow-hidden">
      <header className="px-6 py-6 flex items-center justify-between border-b border-teal-100 bg-white/80 backdrop-blur-xl">
         <button onClick={onBack} className="p-3 bg-teal-50 rounded-2xl text-teal-600">
            {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
         </button>
         <h1 className="text-xl font-bold text-teal-900">{t.SPROUTS}</h1>
         <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-teal-100 shadow-sm flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-teal-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-teal-600/20">
                  <Sprout size={48} />
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-teal-900">{isRTL ? 'توجيه الوالدية والنمو' : 'Parenting & Growth Guidance'}</h2>
                  <p className="text-teal-600/60 font-medium mt-2">
                      {isRTL ? 'حوار مباشر ومسؤول لدعم نمو طفلك وتوازنك.' : 'Direct and responsible dialogue to support your child\'s growth and your balance.'}
                  </p>
              </div>
              
              <div className="bg-teal-50/50 p-6 rounded-2xl text-start border border-teal-50">
                  <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck size={18} className="text-teal-600" />
                      <span className="text-xs font-black uppercase text-teal-600 tracking-widest">{isRTL ? 'المسؤولية أولاً' : 'Responsibility First'}</span>
                  </div>
                  <p className="text-sm text-teal-800 font-medium leading-relaxed">
                      {isRTL ? 'هنا، الصدق هو الطريق للوضوح. د. سكينة تدعمك في بناء روتين ثابت وبيئة عاقلة.' : 'Here, honesty is the path to clarity. Sakinnah supports you in building consistent routines and a rational environment.'}
                  </p>
              </div>

              <button className="w-full py-5 bg-teal-600 text-white rounded-[2rem] font-bold text-lg shadow-lg shadow-teal-600/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <HeartPulse size={24} />
                  <span>{isRTL ? 'بدء جلسة براعم' : 'Start Sprouts Session'}</span>
              </button>
          </div>
      </main>
    </div>
  );
};

export default SproutsWing;
