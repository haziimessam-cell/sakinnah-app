
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Crown, CircleCheck, ShieldCheck, Heart, MapPin, Sparkles, X, Lock } from 'lucide-react';
import { geoService } from '../services/geoService';
import { triggerHaptic } from '../services/hapticService';

interface Props {
  language: Language;
  onSubscribe: () => void;
  onClose?: () => void;
  isTrialExpired?: boolean;
}

const SubscriptionScreen: React.FC<Props> = ({ language, onSubscribe, onClose, isTrialExpired }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [currency, setCurrency] = useState<'EGP' | 'USD'>('USD');
  const [userCountry, setUserCountry] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  const PRICING = {
      EGP: { daily: 30, monthly: 200, quarterly: 500, yearly: 2000 },
      USD: { monthly: 10, quarterly: 25, yearly: 100 }
  };

  useEffect(() => {
      const detectLocation = async () => {
          setInitLoading(true);
          const countryCode = await geoService.getCountryCode();
          setUserCountry(countryCode);
          
          if (countryCode === 'EG') {
              setCurrency('EGP');
          } else {
              setCurrency('USD');
              if (selectedPlan === 'daily') setSelectedPlan('monthly');
          }
          setInitLoading(false);
      };

      detectLocation();
  }, []);

  const handlePay = async () => {
      setLoading(true);
      triggerHaptic();
      setTimeout(() => {
          alert(language === 'ar' ? 'بوابة الدفع ستتوفر قريباً في التحديث القادم.' : 'Payment gateway will be available in the next update.');
          setLoading(false);
      }, 1000);
  };

  const getCurrencySymbol = () => currency === 'EGP' ? (isRTL ? 'ج.م' : 'EGP') : '$';

  const plans = currency === 'EGP' 
    ? [
        { id: 'daily', title: isRTL ? 'يومي' : 'Daily', price: PRICING.EGP.daily },
        { id: 'monthly', title: isRTL ? 'شهري' : 'Monthly', price: PRICING.EGP.monthly, badge: isRTL ? 'الأكثر طلباً' : 'Most Popular' },
        { id: 'quarterly', title: isRTL ? 'ربع سنوي (3 أشهر)' : 'Quarterly (3mo)', price: PRICING.EGP.quarterly },
        { id: 'yearly', title: isRTL ? 'سنوي' : 'Yearly', price: PRICING.EGP.yearly, badge: isRTL ? 'أفضل قيمة' : 'Best Value' },
      ]
    : [
        { id: 'monthly', title: isRTL ? 'Monthly' : 'Monthly', price: PRICING.USD.monthly, badge: isRTL ? 'الأكثر طلباً' : 'Most Popular' },
        { id: 'quarterly', title: isRTL ? 'Quarterly (3mo)' : 'Quarterly (3mo)', price: PRICING.USD.quarterly },
        { id: 'yearly', title: isRTL ? 'Yearly' : 'Yearly', price: PRICING.USD.yearly, badge: isRTL ? 'Best Value' : 'Best Value' },
      ];

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0C10] flex flex-col items-center justify-center p-6 animate-m3-fade-in overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-m3-primary/10 rounded-full blur-[180px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-teal-500/5 rounded-full blur-[180px] animate-pulse pointer-events-none" style={{animationDelay:'2s'}}></div>

        <div className="w-full max-w-lg bg-white/5 backdrop-blur-3xl rounded-m3-xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center p-8 text-center text-white max-h-[90vh] overflow-y-auto no-scrollbar">
            {onClose && !isTrialExpired && (
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-all">
                    <X size={24} />
                </button>
            )}

            <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-yellow-600 rounded-m3-lg flex items-center justify-center shadow-2xl shadow-amber-500/20 mb-8 animate-float shrink-0">
                <Crown size={42} className="text-white drop-shadow-md" strokeWidth={2.5} />
            </div>

            <h1 className="text-3xl font-black mb-4 tracking-tight font-arabic">{isRTL ? 'اشترك في سكينة Pro' : 'Upgrade to Sakinnah Pro'}</h1>
            <p className="text-indigo-100/60 text-sm leading-relaxed mb-10 max-w-xs mx-auto font-medium">
                {isRTL ? 'احصل على وصول كامل للعيادات المتخصصة والتقارير الشهرية.' : 'Get full access to specialized clinics and monthly reports.'}
            </p>

            {isTrialExpired && (
                <div className="mb-8 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-m3-lg flex items-center gap-3 text-red-400 text-sm font-black uppercase tracking-widest">
                    <Lock size={18} />
                    <span>{isRTL ? 'انتهت الفترة التجريبية' : 'Trial Period Expired'}</span>
                </div>
            )}

            {initLoading ? (
                <div className="h-64 flex flex-col items-center justify-center w-full gap-5">
                    <div className="w-12 h-12 border-4 border-m3-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-m3-primary/50">Detecting Region...</p>
                </div>
            ) : (
                <div className="w-full space-y-4 mb-10">
                    {plans.map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id as any)}
                            className={`relative w-full p-6 rounded-m3-lg border transition-all flex items-center justify-between group
                            ${selectedPlan === plan.id 
                                ? 'bg-white/10 border-m3-primary shadow-2xl scale-[1.02]' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === plan.id ? 'border-m3-primary bg-m3-primary' : 'border-white/20'}`}>
                                    {selectedPlan === plan.id && <CircleCheck size={14} className="text-white" />}
                                </div>
                                <div className="text-start">
                                    <div className="text-[15px] font-bold tracking-tight">{plan.title}</div>
                                    {plan.badge && (
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${plan.id === 'yearly' ? 'text-amber-400' : 'text-m3-primary'}`}>
                                            {plan.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-2xl font-black tabular-nums">
                                {plan.price}
                                <span className="text-[11px] font-bold opacity-30 ml-2 uppercase">{getCurrencySymbol()}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <div className="w-full mt-auto">
                <button 
                    onClick={handlePay}
                    disabled={loading || initLoading}
                    className="w-full py-6 bg-white text-[#0A0C10] rounded-m3-full font-black text-lg shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-4 border-gray-900 rounded-full border-t-transparent animate-spin"></div>
                    ) : (
                        <>
                            <Heart size={24} fill="currentColor" className="text-red-500" />
                            <span className="uppercase tracking-widest">{isRTL ? 'بدء الاشتراك' : 'Start Subscription'}</span>
                        </>
                    )}
                </button>
                <p className="mt-8 text-[10px] text-white/20 font-black uppercase tracking-[0.5em] flex items-center justify-center gap-3">
                    <Lock size={12} />
                    {isRTL ? 'دفع آمن ومشفر بالكامل' : 'SECURE & ENCRYPTED PAYMENT'}
                </p>
            </div>
        </div>
    </div>
  );
};

export default SubscriptionScreen;
