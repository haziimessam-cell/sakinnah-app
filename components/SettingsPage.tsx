
import React from 'react';
import { User, Language } from '../types';
import { ArrowRight, ArrowLeft, Bell, Trash2, Shield, LogOut, Globe, Download, Cloud, Upload, Lock, ShieldCheck, ToggleLeft, ToggleRight, Mic, Phone, CircleAlert, Moon, Zap } from 'lucide-react';

interface Props {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const SettingsPage: React.FC<Props> = ({ user, onBack, onLogout, language, setLanguage }) => {
  const isRTL = language === 'ar';

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900 flex flex-col pt-safe pb-safe overflow-hidden animate-fadeIn">
      <header className="px-6 py-4 bg-white dark:bg-slate-800 shadow-sm border-b border-gray-100 dark:border-slate-700 flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">
          {isRTL ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">{isRTL ? 'الإعدادات' : 'Settings'}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{isRTL ? 'إدارة البيانات' : 'Data Management'}</h2>
          
          <button onClick={() => {if(confirm('Clear simulation history?')) localStorage.removeItem('sakinnah_sim_history');}} className="w-full flex items-center justify-between py-3 group mb-2 hover:bg-white/40 dark:hover:bg-slate-700 rounded-xl transition-colors px-2">
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sky-50/80 dark:bg-sky-900/50 rounded-lg flex items-center justify-center text-sky-500 group-hover:bg-sky-100 transition-colors">
                      <Zap size={16} />
                  </div>
                  <div className="text-start">
                      <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-sky-600 transition-colors block">
                          {isRTL ? 'مسح تاريخ المحاكاة' : 'Clear Sim History'}
                      </span>
                  </div>
              </div>
          </button>
          
          <button onClick={onLogout} className="w-full flex items-center justify-between py-3 group hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors px-2 text-red-500">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-50 dark:bg-red-900/50 rounded-lg flex items-center justify-center text-red-500">
                <LogOut size={16} />
              </div>
              <span className="font-medium">{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
            </div>
          </button>
        </section>

        <section className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{isRTL ? 'اللغة' : 'Language'}</h2>
          <div className="flex bg-gray-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-gray-100 dark:border-slate-700">
            <button onClick={() => setLanguage('ar')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${language === 'ar' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-gray-400'}`}>العربية</button>
            <button onClick={() => setLanguage('en')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-gray-400'}`}>English</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SettingsPage;
