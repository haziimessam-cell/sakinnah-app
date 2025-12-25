
import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Crown, CircleCheck, ShieldCheck, Heart, MapPin, Sparkles, X, Lock } from 'lucide-react';
import { geoService } from '../services/geoService';
import { syncService } from '../services/syncService';
import { triggerHaptic, triggerSuccessHaptic } from '../services/hapticService';

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
      USD: { daily: 1, monthly: 10, quarterly: 25, yearly: 100 }
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
          alert(t.gatewayComingSoon);
          setLoading(false);
      }, 1000);
  };

  const getCurrencySymbol = () => currency === 'EGP' ? (isRTL ? 'ج.م' : 'EGP') : '$';

  const plans = currency === 'EGP' 
    ? [
        { id: 'daily', title: t.plan_daily, price: PRICING.EGP.daily },
        { id: 'monthly', title: t.plan_monthly, price: PRICING.EGP.monthly, badge: t.mostPopular, badgeColor: 'bg-m3-primary' },
        { id: 'quarterly', title: t.plan_quarterly, price: PRICING.EGP.quarterly },
        { id: 'yearly', title: t.plan_yearly, price: PRICING.EGP.yearly, badge: t.bestValue, badgeColor: 'bg-amber-500' },
      ]
    : [
        { id: 'monthly', title: t.plan_monthly, price: PRICING.USD.monthly, badge: t.mostPopular, badgeColor: 'bg-m3-primary' },
        { id: 'quarterly', title: t.plan_quarterly, price: PRICING.USD.quarterly },
        { id: 'yearly', title: t.plan_yearly, price: PRICING.USD.yearly, badge: t.bestValue, badgeColor: 'bg-amber-500' },
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

            <h1 className="text-3xl font-black mb-4 tracking-tight font-arabic">{t.subTitle}</h1>
            <p className="text-indigo-100/60 text-sm leading-relaxed mb-10 max-w-xs mx-auto font-medium">{t.subDesc}</p>

            {isTrialExpired && (
                <div className="mb-8 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-m3-lg flex items-center gap-3 text-red-400 text-sm font-black uppercase tracking-widest">
                    <Lock size={18} />
                    <span>{t.trialEnded}</span>
                </div>
            )}

            {initLoading ? (
                <div className="h-64 flex flex-col items-center justify-center w-full gap-5">
                    <div className="w-12 h-12 border-4 border-m3-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-m3-primary/50">Securing Region...</p>
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

            <div className="space-y-5 text-start text-xs w-full mb-12 px-4">
                <div className="flex items-center gap-5 text-indigo-100/70">
                    <div className="w-10 h-10 bg-white/5 rounded-m3-md flex items-center justify-center border border-white/5"><Sparkles size={18} className="text-m3-primary" /></div>
                    <span className="font-bold text-sm">{t.unlimitedAI}</span>
                </div>
                <div className="flex items-center gap-5 text-indigo-100/70">
                    <div className="w-10 h-10 bg-white/5 rounded-m3-md flex items-center justify-center border border-white/5"><ShieldCheck size={18} className="text-m3-primary" /></div>
                    <span className="font-bold text-sm">{t.allTools}</span>
                </div>
            </div>

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
                            <span className="uppercase tracking-widest">{t.subButton}</span>
                        </>
                    )}
                </button>
                <p className="mt-8 text-[10px] text-white/20 font-black uppercase tracking-[0.5em] flex items-center justify-center gap-3">
                    <Lock size={12} />
                    {t.subNote}
                </p>
            </div>
        </div>
    </div>
  );
};

export default SubscriptionScreen;
