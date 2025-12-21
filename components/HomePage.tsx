
import React, { useState } from 'react';
import { User, Category, Language, ViewStateName } from '../types';
import { translations } from '../translations';
import { CATEGORIES } from '../constants';
import CategoryCard from './CategoryCard';
import MoodTracker from './MoodTracker';
import NotificationCenter from './NotificationCenter';
import { Home, BookOpen, Sprout, User as UserIcon, Bell, Sparkles, Moon, Ghost, MessageSquareHeart } from 'lucide-react';

interface Props {
  user: User;
  language: Language;
  onSelectCategory: (cat: Category) => void;
  onNavigate: (view: ViewStateName) => void;
}

const HomePage: React.FC<Props> = ({ user, language, onSelectCategory, onNavigate }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [showNotifs, setShowNotifs] = useState(false);

  const labs = [
    { id: 'DREAM', title: isRTL ? 'تحليل الأحلام' : 'Dream Analysis', icon: <Moon size={22} />, color: 'bg-indigo-600', desc: isRTL ? 'فك رموز اللاوعي' : 'Decipher subconscious' },
    { id: 'SLEEP_SANCTUARY', title: isRTL ? 'ملاذ النوم' : 'Sleep Sanctuary', icon: <Moon size={22} fill="currentColor" />, color: 'bg-slate-900', desc: isRTL ? 'حكايا وموسيقى منومة' : 'Hypnotic tales & music' },
    { id: 'SOCIAL_SANDBOX', title: isRTL ? 'مختبر المواجهة' : 'Social Crucible', icon: <Ghost size={22} />, color: 'bg-emerald-600', desc: isRTL ? 'تدريب على الثبات' : 'Resilience training' },
    { id: 'FADFADA', title: isRTL ? 'فضفضة سكينة' : 'Deep Venting', icon: <MessageSquareHeart size={22} />, color: 'bg-orange-500', desc: isRTL ? 'احتواء بدون أحكام' : 'Judgment-free space' },
  ];

  return (
    <div className="h-full bg-slate-50 flex flex-col pt-safe pb-safe animate-fadeIn overflow-hidden">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/60 backdrop-blur-xl border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold border border-emerald-200 shadow-sm">
            {user.name[0]}
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{isRTL ? 'مرحباً بك' : 'Welcome back'}</p>
            <h2 className="text-sm font-black text-slate-800">{user.name}</h2>
          </div>
        </div>
        <button 
          onClick={() => setShowNotifs(true)} 
          className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 relative active:scale-95 transition-all"
        >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      </header>

      {/* Notification Center Overlay */}
      {showNotifs && (
          <NotificationCenter 
            language={language} 
            onClose={() => setShowNotifs(false)} 
            onNavigate={onNavigate} 
          />
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 p-6 space-y-8">
        {/* Mood Tracker */}
        <section className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                {isRTL ? 'طقس روحك اليوم' : 'Your Soul Weather'}
            </h3>
            <MoodTracker onSelect={() => {}} language={language} />
        </section>

        {/* Labs / Specialized Tools */}
        <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">{isRTL ? 'المختبرات النفسية المتخصصة' : 'Specialized Labs'}</h3>
            <div className="grid grid-cols-2 gap-3">
                {labs.map((lab) => (
                    <button 
                        key={lab.id}
                        onClick={() => onNavigate(lab.id as ViewStateName)}
                        className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-start group active:scale-95 h-36 flex flex-col justify-between"
                    >
                        <div className={`w-10 h-10 ${lab.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                            {lab.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 mb-1">{lab.title}</h4>
                          <p className="text-[9px] text-slate-400 font-bold leading-tight">{lab.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </section>

        {/* Therapy Categories */}
        <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">{isRTL ? 'الأقسام العلاجية' : 'Therapeutic Tracks'}</h3>
            <div className="grid grid-cols-2 gap-4">
                {CATEGORIES.map((cat, idx) => (
                    <CategoryCard 
                        key={cat.id} 
                        category={cat} 
                        onClick={onSelectCategory} 
                        onInfo={() => {}} 
                        index={idx} 
                        language={language} 
                    />
                ))}
            </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-10 py-4 pb-10 flex justify-between items-center z-50">
          <button onClick={() => onNavigate('HOME')} className="text-emerald-600 flex flex-col items-center gap-1 scale-110">
              <Home size={22} fill="currentColor" className="opacity-20" />
              <span className="text-[9px] font-black uppercase tracking-tighter">{isRTL ? 'الرئيسية' : 'Home'}</span>
          </button>
          <button onClick={() => onNavigate('JOURNAL')} className="text-slate-300 flex flex-col items-center gap-1 hover:text-emerald-500 transition-colors">
              <BookOpen size={22} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{isRTL ? 'المفكرة' : 'Journal'}</span>
          </button>
          <button onClick={() => onNavigate('GARDEN')} className="text-slate-300 flex flex-col items-center gap-1 hover:text-emerald-400 transition-colors">
              <Sprout size={22} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{isRTL ? 'الحديقة' : 'Garden'}</span>
          </button>
          <button onClick={() => onNavigate('PROFILE')} className="text-slate-300 flex flex-col items-center gap-1 hover:text-emerald-500 transition-colors">
              <UserIcon size={22} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{isRTL ? 'حسابي' : 'Profile'}</span>
          </button>
      </nav>
    </div>
  );
};

export default HomePage;
