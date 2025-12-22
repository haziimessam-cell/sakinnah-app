
import React from 'react';
import { User, Language, ViewStateName } from '../types';
import { translations } from '../translations';
import { 
  Zap, ShieldAlert, CloudRain, Activity, Sprout, HeartHandshake, 
  ChevronRight, Bell, Search, Calendar, Sparkles, Moon, BrainCircuit
} from 'lucide-react';

interface Props {
  user: User;
  language: Language;
  onSelectCategory: (id: string) => void;
  onNavigate: (view: ViewStateName) => void;
}

const HomePage: React.FC<Props> = ({ user, language, onSelectCategory, onNavigate }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';

  const clinics = [
    { id: 'stress', title: t.stressWing, desc: t.stressDesc, icon: <Zap size={22} />, color: "bg-ios-azure" },
    { id: 'anxiety', title: t.anxietyWing, desc: t.anxietyDesc, icon: <ShieldAlert size={22} />, color: "bg-ios-azure" },
    { id: 'depression', title: t.depressionWing, desc: t.depressionDesc, icon: <CloudRain size={22} />, color: "bg-ios-azure" },
    { id: 'ocd', title: t.ocdWing, desc: t.ocdDesc, icon: <BrainCircuit size={22} />, color: "bg-ios-azure" },
    { id: 'bipolar', title: t.bipolarWing, desc: t.bipolarDesc, icon: <Activity size={22} />, color: "bg-ios-azure" },
    { id: 'sprouts', title: t.sproutsWing, desc: t.sproutsDesc, icon: <Sprout size={22} />, color: "bg-ios-emerald" },
    { id: 'relationships', title: t.relWing, desc: t.relDesc, icon: <HeartHandshake size={22} />, color: "bg-ios-emerald" }
  ];

  return (
    <div className="h-full bg-white flex flex-col pt-safe pb-safe overflow-hidden">
      {/* Header - iOS Style Large Title */}
      <header className="px-6 pt-10 pb-6 flex flex-col gap-1 bg-white sticky top-0 z-30">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-ios-azure uppercase tracking-wider">
                {new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('NOTIFICATIONS')} className="text-ios-azure p-2 bg-ios-azure/5 rounded-full"><Bell size={24} /></button>
                <button onClick={() => onNavigate('PROFILE')} className="w-10 h-10 bg-ios-azure rounded-full border-2 border-white flex items-center justify-center font-bold text-white shadow-lg shadow-ios-azure/20">{user.name[0]}</button>
            </div>
        </div>
        <h1 className="large-title animate-ios-reveal">
            {isRTL ? 'مرحباً، ' : 'Hello, '}{user.name}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-8 pb-32">
        {/* iOS Pure White Search Bar */}
        <div className="relative group animate-ios-reveal" style={{ animationDelay: '100ms' }}>
            <Search className="absolute left-4 top-3.5 text-ios-azure/40" size={20} />
            <input 
                type="text" 
                placeholder={isRTL ? 'ابحث عن الطمأنينة...' : 'Search for peace...'} 
                className="w-full bg-ios-slate h-12 rounded-2xl pl-12 pr-4 text-[17px] outline-none transition-all focus:bg-white border-2 border-transparent focus:border-ios-azure/10 text-ios-azureDeep"
            />
        </div>

        {/* Featured Card - The Sanctuary */}
        <section className="animate-ios-reveal" style={{ animationDelay: '200ms' }}>
            <div 
              onClick={() => onNavigate('WELLNESS_SANCTUARY')}
              className="ios-card p-8 flex flex-col justify-between h-56 relative overflow-hidden bg-gradient-to-br from-ios-azure to-ios-azureDeep"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-6"><Sparkles size={24} /></div>
                    <h3 className="text-2xl font-bold text-white mb-1 leading-tight">{t.wellnessSanctuary}</h3>
                    <p className="text-[15px] text-white/80 font-medium leading-relaxed">{t.wellnessSanctuaryDesc}</p>
                </div>
                <div className="relative z-10 flex justify-end">
                    <div className="bg-white text-ios-azure px-5 py-2 rounded-full text-sm font-bold shadow-sm">
                        {isRTL ? 'استكشف' : 'Explore'}
                    </div>
                </div>
            </div>
        </section>

        {/* Specialized Clinics List */}
        <section className="space-y-5 animate-ios-reveal" style={{ animationDelay: '300ms' }}>
            <h2 className="text-[22px] font-bold text-ios-azureDeep px-1">{isRTL ? 'العيادات المتخصصة' : 'Specialized Clinics'}</h2>
            <div className="grid grid-cols-1 gap-4">
                {clinics.map((clinic, idx) => (
                    <button 
                        key={clinic.id} 
                        onClick={() => onSelectCategory(clinic.id)}
                        className="ios-card p-5 flex items-center gap-5"
                    >
                        <div className={`w-14 h-14 ${clinic.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-ios-azure/10`}>
                            {clinic.icon}
                        </div>
                        <div className="flex-1 text-start">
                            <h4 className="text-[18px] font-bold text-ios-azureDeep leading-tight">{clinic.title}</h4>
                            <p className="text-[13px] text-ios-azure/60 font-semibold">{clinic.desc}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-ios-slate flex items-center justify-center text-ios-azure">
                            <ChevronRight size={18} className={isRTL ? 'rotate-180' : ''} />
                        </div>
                    </button>
                ))}
            </div>
        </section>

        {/* Motivational Footnote */}
        <footer className="py-12 text-center animate-ios-reveal" style={{ animationDelay: '400ms' }}>
             <p className="text-[14px] font-semibold text-ios-azure/40 italic px-12 leading-relaxed">
                {isRTL ? '"السكينة هي لغة الروح حين تتوقف عن القتال."' : '"Serenity is the soul\'s language when it stops fighting."'}
             </p>
        </footer>
      </main>

      {/* Tab Bar - iOS Style with Blur */}
      <nav className="ios-blur fixed bottom-0 left-0 right-0 h-24 border-t border-ios-azure/5 flex justify-around items-center z-50 safe-pb px-6">
          <button onClick={() => onNavigate('HOME')} className="flex flex-col items-center gap-1.5 text-ios-azure">
              <Activity size={26} strokeWidth={2.5} />
              <span className="text-[11px] font-bold">{t.home}</span>
          </button>
          <button onClick={() => onNavigate('BREATHING')} className="flex flex-col items-center gap-1.5 text-ios-azure/30">
              <Sparkles size={26} />
              <span className="text-[11px] font-bold">{isRTL ? 'تنفس' : 'Breathe'}</span>
          </button>
          <button onClick={() => onNavigate('PROFILE')} className="flex flex-col items-center gap-1.5 text-ios-azure/30">
              <Moon size={26} />
              <span className="text-[11px] font-bold">{t.profile}</span>
          </button>
      </nav>
    </div>
  );
};

export default HomePage;
