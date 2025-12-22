
import React from 'react';
import { User, Language, ViewStateName } from '../types';
import { translations } from '../translations';
import { 
  Zap, ShieldAlert, CloudRain, Activity, Sprout, HeartHandshake, 
  ChevronLeft, ChevronRight, User as UserIcon, HeartPulse, Sparkles, Moon, MessageSquare,
  ArrowUpRight, Star, Settings, Bell
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
    { id: 'stress', title: t.stressWing, desc: t.stressDesc, icon: <Zap size={22} />, color: "from-orange-400 to-amber-500" },
    { id: 'anxiety', title: t.anxietyWing, desc: t.anxietyDesc, icon: <ShieldAlert size={22} />, color: "from-sky-400 to-indigo-500" },
    { id: 'depression', title: t.depressionWing, desc: t.depressionDesc, icon: <CloudRain size={22} />, color: "from-blue-500 to-slate-700" },
    { id: 'bipolar', title: t.bipolarWing, desc: t.bipolarDesc, icon: <Activity size={22} />, color: "from-purple-500 to-pink-600" },
    { id: 'sprouts', title: t.sproutsWing, desc: t.sproutsDesc, icon: <Sprout size={22} />, color: "from-emerald-400 to-teal-600" },
    { id: 'relationships', title: t.relWing, desc: t.relDesc, icon: <HeartHandshake size={22} />, color: "from-rose-400 to-pink-500" }
  ];

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isRTL ? "صباح السكينة" : "Morning Serenity";
    if (hour < 18) return isRTL ? "يومك مبارك" : "A Blessed Day";
    return isRTL ? "مساء الهدوء" : "Evening Peace";
  };

  return (
    <div className="h-full flex flex-col pt-safe pb-safe overflow-hidden font-sans select-none">
      {/* Upper Navigation - Global Standard */}
      <header className="px-8 py-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-[1.4rem] bg-sakinnah-navy flex items-center justify-center text-sakinnah-slate font-black text-xl shadow-2xl">
              {user.name[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-sakinnah-emerald rounded-full border-4 border-sakinnah-slate"></div>
          </div>
          <div>
            <p className="text-[10px] font-black text-sakinnah-navy/30 uppercase tracking-[0.2em]">{getTimeGreeting()}</p>
            <h2 className="text-xl font-black text-sakinnah-navy leading-none tracking-tight">{user.name}</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('NOTIFICATIONS')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-all">
                <Bell size={20} />
            </button>
            <button onClick={() => onNavigate('PROFILE')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-sakinnah-navy transition-all">
                <Settings size={20} />
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-10 pb-32 pt-2">
        {/* The Sanctuary - Immersive Card */}
        <section className="animate-reveal">
            <div 
              onClick={() => onNavigate('WELLNESS_SANCTUARY')}
              className="group relative h-72 bg-sakinnah-navy rounded-[3rem] p-10 text-white overflow-hidden shadow-2xl transition-transform active:scale-[0.97] cursor-pointer"
            >
                {/* Visual Elements */}
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-sakinnah-azure/10"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sakinnah-azure/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-[4000ms]"></div>
                <div className="absolute top-10 right-10 text-white/5 group-hover:rotate-12 transition-transform duration-[3000ms]">
                    <Sparkles size={200} strokeWidth={0.5} />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-6">
                            <Sparkles size={14} className="text-sakinnah-azure animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t.wellnessSanctuary}</span>
                        </div>
                        <h3 className="text-4xl font-black leading-none tracking-tighter italic max-w-[280px]">
                            {t.wellnessSanctuaryDesc}
                        </h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex -space-x-3">
                            <div className="w-11 h-11 rounded-full bg-sakinnah-gold border-2 border-sakinnah-navy flex items-center justify-center shadow-lg"><MessageSquare size={18} /></div>
                            <div className="w-11 h-11 rounded-full bg-sakinnah-azure border-2 border-sakinnah-navy flex items-center justify-center shadow-lg"><Moon size={18} /></div>
                            <div className="w-11 h-11 rounded-full bg-sakinnah-emerald border-2 border-sakinnah-navy flex items-center justify-center shadow-lg"><Star size={18} /></div>
                        </div>
                        <div className="flex items-center gap-2 font-black text-xs text-sakinnah-azure uppercase tracking-widest">
                            {isRTL ? 'استكشف الملاذ' : 'EXPLORE'}
                            <ArrowUpRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Specialized Clinics Grid */}
        <section className="space-y-6 animate-reveal" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black text-sakinnah-navy/40 uppercase tracking-[0.4em] flex items-center gap-3">
                    <HeartPulse size={16} className="text-sakinnah-azure" />
                    {isRTL ? 'العيادات التخصصية' : 'SPECIALIZED CLINICS'}
                </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {clinics.map((clinic, idx) => (
                    <button 
                        key={clinic.id} 
                        onClick={() => onSelectCategory(clinic.id)}
                        style={{ animationDelay: `${300 + idx * 100}ms` }}
                        className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group active:scale-[0.98] transition-all text-start hover:border-sakinnah-azure/20 hover:shadow-xl hover:shadow-slate-200/50 animate-reveal"
                    >
                        <div className={`w-16 h-16 bg-gradient-to-br ${clinic.color} rounded-[1.8rem] flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-2 transition-all duration-500`}>
                            {clinic.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xl font-black text-sakinnah-navy tracking-tight">{clinic.title}</h4>
                            <p className="text-[10px] font-bold text-sakinnah-navy/40 uppercase leading-relaxed tracking-wider">{clinic.desc}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-sakinnah-azure group-hover:text-white transition-all">
                            {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        </div>
                    </button>
                ))}
            </div>
        </section>

        {/* Daily Insight Placeholder */}
        <section className="pb-20 animate-reveal" style={{ animationDelay: '1s' }}>
            <div className="bg-sakinnah-emerald/5 border border-sakinnah-emerald/10 rounded-[2.5rem] p-8 flex items-start gap-6">
                <div className="w-12 h-12 bg-sakinnah-emerald/10 rounded-2xl flex items-center justify-center text-sakinnah-emerald">
                    <Activity size={24} />
                </div>
                <div>
                    <h5 className="text-[10px] font-black text-sakinnah-emerald uppercase tracking-[0.2em] mb-2">{isRTL ? 'بصيرة اليوم' : 'DAILY INSIGHT'}</h5>
                    <p className="text-sm font-bold text-sakinnah-navy/70 leading-relaxed italic">
                        {isRTL ? '"السكينة لا تعني غياب العواصف، بل الهدوء الذي تجده في مركزها."' : '"Serenity is not the absence of storm, but the peace you find at its center."'}
                    </p>
                </div>
            </div>
        </section>
      </main>

      {/* Modern Bottom Navigation */}
      <nav className="fixed bottom-8 left-8 right-8 h-22 glass-premium rounded-[2.8rem] px-10 flex justify-between items-center z-50 shadow-2xl shadow-indigo-500/10 border border-white/50">
          <button onClick={() => onNavigate('HOME')} className="flex flex-col items-center gap-1 group">
              <div className="p-3 bg-sakinnah-navy rounded-2xl text-white shadow-lg"><Activity size={24} /></div>
          </button>
          <button onClick={() => onNavigate('BREATHING')} className="flex flex-col items-center gap-1 group text-slate-300 hover:text-sakinnah-azure transition-colors">
              <Sparkles size={26} />
          </button>
          <button onClick={() => onNavigate('PROFILE')} className="flex flex-col items-center gap-1 group text-slate-300 hover:text-sakinnah-navy transition-colors">
              <UserIcon size={26} />
          </button>
      </nav>
    </div>
  );
};

export default HomePage;
