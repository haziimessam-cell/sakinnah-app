
import React, { useState } from 'react';
import { User, Language, OutputMode } from '../types';
import { translations } from '../translations';
import { 
  ArrowRight, ArrowLeft, Globe, Moon, Shield, LogOut, 
  ChevronRight, ChevronLeft, Trash2, Headphones, 
  MessageSquare, Activity, Sprout
} from 'lucide-react';
import { triggerHaptic } from '../services/hapticService';

interface Props {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onUpdateUser: (updatedUser: User) => void;
  onNavigate?: (view: string) => void;
}

const SettingsPage: React.FC<Props> = ({ user, onBack, onLogout, language, setLanguage, onUpdateUser, onNavigate }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const [logoPressCount, setLogoPressCount] = useState(0);

  const handleDeleteAll = () => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف جميع بياناتك نهائياً؟' : 'Are you sure you want to permanently delete all your data?')) {
        localStorage.clear();
        onLogout();
    }
  };

  const updatePreference = (mode: OutputMode) => {
    const updated = { ...user, preferredOutput: mode };
    onUpdateUser(updated);
    localStorage.setItem('sakinnah_user', JSON.stringify(updated));
  };

  const handleLogoClick = () => {
    const nextCount = logoPressCount + 1;
    setLogoPressCount(nextCount);
    if (nextCount >= 7) {
      triggerHaptic('Heavy' as any);
      onNavigate?.('DIAGNOSTIC');
      setLogoPressCount(0);
    } else {
      triggerHaptic();
    }
  };

  return (
    <div className="h-full bg-m3-background flex flex-col pt-safe pb-safe overflow-hidden animate-m3-fade-in">
      <header className="px-6 py-6 bg-white border-b border-m3-outline/5 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-m3-surfaceVariant rounded-xl transition-all">
          {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
        </button>
        <h1 className="text-xl font-bold text-m3-onSurface">{t.settings}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-24 text-center">
        
        <div 
          onClick={handleLogoClick}
          className="mx-auto w-24 h-24 bg-m3-primaryContainer text-m3-primary rounded-[2rem] flex items-center justify-center mb-2 shadow-sm animate-float cursor-pointer active:scale-95 transition-all"
        >
          <Sprout size={48} />
        </div>
        <p className="text-[10px] font-black text-m3-outline uppercase tracking-[0.4em] mb-8">Sakinnah v4.0.0</p>

        {/* Language Section */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-m3-outline/10 space-y-4 text-start">
          <h2 className="text-xs font-bold text-m3-onSurfaceVariant uppercase tracking-widest flex items-center gap-2">
            <Globe size={16} /> {t.language}
          </h2>
          <div className="flex bg-m3-surfaceVariant p-1 rounded-2xl">
            <button 
              onClick={() => setLanguage('ar')} 
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${language === 'ar' ? 'bg-m3-primary text-m3-onPrimary shadow-sm' : 'text-m3-onSurfaceVariant'}`}
            >
              العربية
            </button>
            <button 
              onClick={() => setLanguage('en')} 
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${language === 'en' ? 'bg-m3-primary text-m3-onPrimary shadow-sm' : 'text-m3-onSurfaceVariant'}`}
            >
              English
            </button>
          </div>
        </section>

        {/* Session Preference Section */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-m3-outline/10 space-y-4 text-start">
          <h2 className="text-xs font-bold text-m3-onSurfaceVariant uppercase tracking-widest flex items-center gap-2">
            <Headphones size={16} /> {t.defaultOutput}
          </h2>
          <div className="flex bg-m3-surfaceVariant p-1 rounded-2xl">
            <button 
              onClick={() => updatePreference('text')} 
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${user.preferredOutput === 'text' ? 'bg-m3-primary text-m3-onPrimary shadow-sm' : 'text-m3-onSurfaceVariant'}`}
            >
              <MessageSquare size={16} /> {t.textMode}
            </button>
            <button 
              onClick={() => updatePreference('audio')} 
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${user.preferredOutput === 'audio' ? 'bg-m3-primary text-m3-onPrimary shadow-sm' : 'text-m3-onSurfaceVariant'}`}
            >
              <Headphones size={16} /> {t.audioMode}
            </button>
          </div>
        </section>

        {/* System Locked Settings */}
        <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-m3-outline/10 space-y-2 text-start">
          <button className="w-full flex items-center justify-between py-4 group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-m3-surfaceVariant text-m3-onSurfaceVariant rounded-xl"><Moon size={18} /></div>
              <span className="font-bold text-m3-onSurface">{t.appearance}</span>
            </div>
            {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
          <div className="h-[1px] bg-m3-outline/5 mx-2"></div>
          <button className="w-full flex items-center justify-between py-4 group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-m3-surfaceVariant text-m3-onSurfaceVariant rounded-xl"><Shield size={18} /></div>
              <span className="font-bold text-m3-onSurface">{t.privacy}</span>
            </div>
            {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </section>

        {/* Hidden/Special Diagnostic Suite access */}
        {logoPressCount > 3 && (
           <button 
            onClick={() => onNavigate?.('DIAGNOSTIC')}
            className="w-full bg-indigo-50 text-indigo-600 p-6 rounded-[2rem] border border-indigo-100 shadow-sm font-bold flex items-center justify-center gap-3 active:bg-indigo-100 transition-colors animate-m3-slide-up"
          >
            <Activity size={20} />
            {t.diagnosticTitle} ({7 - logoPressCount} more taps)
          </button>
        )}

        {/* Data Management */}
        <button 
          onClick={handleDeleteAll}
          className="w-full bg-white text-red-500 p-6 rounded-[2rem] border border-red-50 shadow-sm font-bold flex items-center justify-center gap-3 active:bg-red-50 transition-colors"
        >
          <Trash2 size={20} />
          {t.deleteData}
        </button>

        {/* Logout */}
        <button 
          onClick={onLogout}
          className="w-full bg-m3-surfaceVariant/50 text-m3-onSurfaceVariant p-6 rounded-[2rem] border border-m3-outline/10 font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          <LogOut size={20} />
          {t.logout}
        </button>
      </main>
    </div>
  );
};

export default SettingsPage;
