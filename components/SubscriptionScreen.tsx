
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Crown, CheckCircle, ShieldCheck, Heart } from 'lucide-react';

interface Props {
  language: Language;
  onSubscribe: () => void;
}

const SubscriptionScreen: React.FC<Props> = ({ language, onSubscribe }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [currency, setCurrency] = useState<'EGP' | 'USD'>('USD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      // Smart Location Detection (Simulation)
      // In a real app, use IP Geolocation API.
      // Here we simulate based on timezone.
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Cairo') || tz.includes('Egypt') || language === 'ar') {
          setCurrency('EGP');
      } else {
          setCurrency('USD');
      }
  }, [language]);

  const handlePay = () => {
      setLoading(true);
      // Simulate Payment Processing
      setTimeout(() => {
          onSubscribe();
      }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-6 animate-fadeIn overflow-hidden">
        
        {/* Ambient Background */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-teal-500/20 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{animationDelay:'2s'}}></div>

        <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden flex flex-col items-center p-8 text-center text-white">
            
            {/* Crown Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 mb-6 animate-float">
                <Crown size={48} className="text-white drop-shadow-md" />
            </div>

            <h1 className="text-2xl font-bold mb-3">{t.subTitle}</h1>
            <p className="text-indigo-200 text-sm leading-relaxed mb-8">{t.subDesc}</p>

            {/* Pricing Card */}
            <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 mb-8 relative group hover:bg-white/10 transition-colors cursor-default">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-widest">
                    {language === 'ar' ? 'الأكثر طلباً' : 'Best Value'}
                </div>
                
                <div className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
                    {currency === 'EGP' ? '200' : '7'}
                    <span className="text-lg font-medium opacity-60">{currency === 'EGP' ? 'EGP' : '$'}</span>
                </div>
                <div className="text-xs text-indigo-300 uppercase tracking-widest font-medium mb-4">
                    {language === 'ar' ? 'شهرياً' : 'Per Month'}
                </div>

                <div className="space-y-2 text-start text-sm px-4">
                    <div className="flex items-center gap-3 opacity-90">
                        <CheckCircle size={16} className="text-green-400" />
                        <span>{language === 'ar' ? 'جلسات ذكاء اصطناعي غير محدودة' : 'Unlimited AI Therapy Sessions'}</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-90">
                        <CheckCircle size={16} className="text-green-400" />
                        <span>{language === 'ar' ? 'جميع الأدوات (حديقة الروح، الأحلام)' : 'All Tools (Soul Garden, Dreams)'}</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-90">
                        <CheckCircle size={16} className="text-green-400" />
                        <span>{language === 'ar' ? 'خصوصية تامة بدون إعلانات' : 'Total Privacy & Ad-Free'}</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={handlePay}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                ) : (
                    <>
                        <Heart size={20} fill="currentColor" className="text-pink-300" />
                        <span>{t.subButton}</span>
                    </>
                )}
            </button>

            <div className="mt-4 flex items-center gap-2 text-[10px] text-indigo-300/60">
                <ShieldCheck size={12} />
                <span>{t.subNote}</span>
            </div>

        </div>
    </div>
  );
};

export default SubscriptionScreen;
