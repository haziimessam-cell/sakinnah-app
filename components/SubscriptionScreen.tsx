

import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { Crown, CircleCheck, ShieldCheck, Heart, MapPin, Star } from 'lucide-react';
import { geoService } from '../services/geoService';
import { syncService } from '../services/syncService';

interface Props {
  language: Language;
  onSubscribe: () => void;
}

const SubscriptionScreen: React.FC<Props> = ({ language, onSubscribe }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [currency, setCurrency] = useState<'EGP' | 'USD'>('USD');
  const [userCountry, setUserCountry] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  const PRICING = {
      EGP: { daily: 30, monthly: 200, quarterly: 450, yearly: 1300 },
      USD: { daily: 1, monthly: 7, quarterly: 18, yearly: 70 }
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
          }
          setInitLoading(false);
      };

      detectLocation();
  }, []);

  const handlePay = async () => {
      setLoading(true);
      
      // 1. Simulate Payment Gateway (Stripe/Paymob would go here)
      setTimeout(async () => {
          // 2. SECURE UPGRADE: Call server to upgrade (Anti-Hack)
          const success = await syncService.upgradeSubscription();
          
          if (success) {
              onSubscribe();
          } else {
              alert(t.activationError);
              setLoading(false);
          }
      }, 2000);
  };

  const getPlanPrice = (plan: 'daily' | 'monthly' | 'quarterly' | 'yearly') => {
      return PRICING[currency][plan];
  };

  const getCurrencySymbol = () => currency === 'EGP' ? 'EGP' : '$';

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-6 animate-fadeIn overflow-hidden">
        
        {/* Ambient Background */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-teal-500/20 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{animationDelay:'2s'}}></div>

        <div className="w-full max-w-lg bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-2xl relative overflow-hidden flex flex-col items-center p-6 text-center text-white h-[90vh] md:h-auto overflow-y-auto no-scrollbar">
            
            {/* Crown Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/40 mb-4 animate-float flex-shrink-0">
                <Crown size={32} className="text-white drop-shadow-md" />
            </div>

            <h1 className="text-xl font-bold mb-2">{t.subTitle}</h1>
            <p className="text-indigo-200 text-xs leading-relaxed mb-6 max-w-xs">{t.subDesc}</p>

            {initLoading ? (
                <div className="h-40 flex items-center justify-center w-full">
                    <div className="w-8 h-8 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="w-full grid grid-cols-2 gap-3 mb-6">
                    {/* Plan Cards */}
                    {[
                        { id: 'daily', title: t.plan_daily, price: getPlanPrice('daily') },
                        { id: 'monthly', title: t.plan_monthly, price: getPlanPrice('monthly'), badge: t.mostPopular, badgeColor: 'bg-indigo-500' },
                        { id: 'quarterly', title: t.plan_quarterly, price: getPlanPrice('quarterly') },
                        { id: 'yearly', title: t.plan_yearly, price: getPlanPrice('yearly'), badge: t.bestValue, badgeColor: 'bg-amber-500' },
                    ].map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id as any)}
                            className={`relative p-4 rounded-2xl border transition-all ${
                                selectedPlan === plan.id 
                                ? 'bg-white/20 border-teal-400 shadow-lg scale-[1.02]' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            {plan.badge && (
                                <div className={`absolute -top-2 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap`}>
                                    {plan.badge}
                                </div>
                            )}
                            <div className="text-xs text-indigo-200 font-medium mb-1">{plan.title}</div>
                            <div className="text-xl font-bold flex items-center justify-center gap-1">
                                {plan.price}
                                <span className="text-[10px] font-normal opacity-70">{getCurrencySymbol()}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {userCountry && (
                <div className="flex items-center justify-center gap-1 mb-4 text-[10px] text-indigo-300 opacity-60">
                    <MapPin size={10} />
                    <span>{userCountry} Localized Pricing</span>
                </div>
            )}

            <div className="space-y-2 text-start text-xs px-4 mb-6 w-full max-w-xs mx-auto">
                <div className="flex items-center gap-3 opacity-90">
                    <CircleCheck size={14} className="text-green-400" />
                    <span>{t.unlimitedAI}</span>
                </div>
                <div className="flex items-center gap-3 opacity-90">
                    <CircleCheck size={14} className="text-green-400" />
                    <span>{t.allTools}</span>
                </div>
                <div className="flex items-center gap-3 opacity-90">
                    <CircleCheck size={14} className="text-green-400" />
                    <span>{t.privacyAdFree}</span>
                </div>
            </div>

            <button 
                onClick={handlePay}
                disabled={loading || initLoading}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-auto"
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
