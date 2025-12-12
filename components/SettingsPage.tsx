
import React, { useRef, useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { ArrowRight, ArrowLeft, Bell, Trash2, Shield, LogOut, Globe, Download, Cloud, Upload, Lock, ShieldCheck, ToggleLeft, ToggleRight, Mic, Phone, CircleAlert, Moon } from 'lucide-react';
import { syncService } from '../services/syncService';
import PinLock from './PinLock';

interface Props {
  user: User;
  onBack: () => void;
  onLogout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const SettingsPage: React.FC<Props> = ({ user, onBack, onLogout, language, setLanguage }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  
  // PIN Logic
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinMode, setPinMode] = useState<'setup' | 'disable'>('setup');

  const toggleDarkMode = () => {
      const isDark = !darkMode;
      setDarkMode(isDark);
      if (isDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('sakinnah_theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('sakinnah_theme', 'light');
      }
  };

  const handleClearData = () => {
      if(window.confirm(t.confirmClear)) {
          Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sakinnah_chat_')) {
                  localStorage.removeItem(key);
              }
          });
          alert('Done.');
      }
  };

  const handleSyncPush = async () => {
      if(confirm(t.confirmSync)) {
          const success = await syncService.pushToCloud(user.username);
          if (success) alert(t.syncSuccess);
          else alert(t.syncFail);
      }
  };

  const handleBackup = () => {
      const blob = syncService.createBackup();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sakinnah_backup_${user.username}_${new Date().toISOString().split('T')[0]}.sakinnah`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setLastBackup(new Date());
  };

  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (window.confirm(t.confirmRestore)) {
          setIsRestoring(true);
          const success = await syncService.restoreBackup(file);
          setIsRestoring(false);
          
          if (success) {
              alert(t.restoreSuccess);
              window.location.reload();
          } else {
              alert(t.invalidFile);
          }
      }
  };

  const handlePinAction = () => {
      if (user.pinCode) {
          setPinMode('disable');
          setShowPinSetup(true);
      } else {
          setPinMode('setup');
          setShowPinSetup(true);
      }
  };

  const handlePinSuccess = (pin: string) => {
      let updatedUser = { ...user };
      if (pinMode === 'setup') {
          updatedUser.pinCode = pin;
          alert(t.pinSetupSuccess);
      } else {
          delete updatedUser.pinCode;
          alert(t.pinRemoveSuccess);
      }
      localStorage.setItem('sakinnah_user', JSON.stringify(updatedUser));
      setShowPinSetup(false);
      window.location.reload();
  };

  const handleUpdateSetting = (key: string, value: any) => {
      const updatedUser = { ...user, [key]: value };
      localStorage.setItem('sakinnah_user', JSON.stringify(updatedUser));
  };

  return (
    <div className="h-full bg-transparent flex flex-col pt-safe pb-safe animate-fadeIn">
      
      {showPinSetup && (
          <PinLock 
            mode={pinMode} 
            language={language} 
            onSuccess={handlePinSuccess} 
            onCancel={() => setShowPinSetup(false)}
            storedPin={user.pinCode}
          />
      )}

      <header className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-3 border-b border-white/20 dark:border-white/10">
         <button onClick={onBack} className="p-2 hover:bg-white/60 dark:hover:bg-slate-700 rounded-full transition-colors border border-transparent hover:border-white/40">
             {isRTL ? <ArrowRight size={24} className="text-gray-600 dark:text-gray-200" /> : <ArrowLeft size={24} className="text-gray-600 dark:text-gray-200" />}
         </button>
         <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t.settings}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
          
          {/* Cloud Sync Status Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30">
                      <Cloud size={24} />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg">{t.syncCloud}</h3>
                      <p className="text-blue-100 text-xs flex items-center gap-1">
                          <Shield size={10} /> 
                          {t.encrypted}
                      </p>
                  </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                   <div className="text-xs text-blue-100">
                       {t.statusActive}
                   </div>
                   <button onClick={handleSyncPush} className="bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors">
                       {t.syncNow}
                   </button>
              </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl rounded-2xl shadow-sm border border-white/50 dark:border-slate-700 overflow-hidden">
               <div className="p-4 border-b border-gray-100/50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
                   <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400">{t.personalization}</h3>
               </div>

               {/* Voice Speed */}
               <div className="p-4 border-b border-gray-100/50 dark:border-slate-700">
                   <div className="flex items-center gap-3 mb-3">
                       <div className="w-10 h-10 bg-purple-50/80 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300">
                           <Mic size={20} />
                       </div>
                       <div className="flex-1">
                           <h3 className="font-bold text-gray-800 dark:text-white">{t.voiceSpeed}</h3>
                       </div>
                       <span className="text-sm font-bold text-purple-600 dark:text-purple-300">{user.voiceSpeed || 1.0}x</span>
                   </div>
                   <input 
                      type="range" 
                      min="0.5" 
                      max="1.5" 
                      step="0.1" 
                      defaultValue={user.voiceSpeed || 1.0}
                      onChange={(e) => handleUpdateSetting('voiceSpeed', parseFloat(e.target.value))}
                      className="w-full accent-purple-600 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                   />
               </div>

               {/* Emergency Contact */}
               <div className="p-4 border-b border-gray-100/50 dark:border-slate-700">
                   <div className="flex items-center gap-3 mb-3">
                       <div className="w-10 h-10 bg-red-50/80 dark:bg-red-900/50 rounded-full flex items-center justify-center text-red-500 dark:text-red-300">
                           <Phone size={20} />
                       </div>
                       <div className="flex-1">
                           <h3 className="font-bold text-gray-800 dark:text-white">{t.emergencyContact}</h3>
                       </div>
                   </div>
                   <input 
                      type="tel"
                      placeholder={t.emergencyContactPlaceholder}
                      defaultValue={user.emergencyContact || ''}
                      onBlur={(e) => handleUpdateSetting('emergencyContact', e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-100 outline-none transition-all dark:text-white"
                   />
               </div>

               {/* Dark Mode */}
               <div className="p-4 border-b border-gray-100/50 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300">
                          <Moon size={20} />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 dark:text-white">{t.darkMode}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.darkModeDesc}</p>
                      </div>
                  </div>
                  <button 
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                  >
                    {darkMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
              </div>

               {/* Language */}
               <div className="p-4 border-b border-gray-100/50 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50/80 dark:bg-teal-900/50 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-300">
                          <Globe size={20} />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 dark:text-white">Language / اللغة</h3>
                      </div>
                  </div>
                  <button 
                    onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-sm font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {language === 'ar' ? 'العربية' : 'English'}
                  </button>
              </div>

              {/* Notifications */}
              <div className="p-4 border-b border-gray-100/50 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50/80 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300">
                          <Bell size={20} />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 dark:text-white">{t.notifications}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.notificationsDesc}</p>
                      </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200/80 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
              </div>

              {/* Security PIN Lock */}
              <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.pinCode ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-700'}`}>
                          {user.pinCode ? <ShieldCheck size={20} /> : <Lock size={20} />}
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 dark:text-white">{t.appLock}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.pinCode ? (language === 'ar' ? 'مفعل' : 'Enabled') : (language === 'ar' ? 'غير مفعل' : 'Disabled')}</p>
                      </div>
                  </div>
                  <button onClick={handlePinAction} className={`p-2 rounded-xl transition-colors ${user.pinCode ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100' : 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 hover:bg-primary-100'}`}>
                      {user.pinCode ? (isRTL ? <ToggleRight size={24} /> : <ToggleRight size={24} />) : (isRTL ? <ToggleLeft size={24} className="text-gray-400" /> : <ToggleLeft size={24} className="text-gray-400" />)}
                  </button>
              </div>
          </div>

          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl rounded-2xl shadow-sm border border-white/50 dark:border-slate-700 overflow-hidden">
             <div className="p-4 border-b border-gray-100/50 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">{t.privacyData}</h3>
                  
                  <button onClick={handleBackup} className="w-full flex items-center justify-between py-3 group mb-2 hover:bg-white/40 dark:hover:bg-slate-700 rounded-xl transition-colors px-2">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-50/80 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors">
                              <Download size={16} />
                          </div>
                          <div className="text-start">
                              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-emerald-600 transition-colors block">
                                  {t.backupFile}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                  {lastBackup ? t.lastSaved : t.saveEncrypted}
                              </span>
                          </div>
                      </div>
                  </button>
                  
                  <button onClick={handleRestoreClick} className="w-full flex items-center justify-between py-3 group mb-2 hover:bg-white/40 dark:hover:bg-slate-700 rounded-xl transition-colors px-2">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-50/80 dark:bg-amber-900/50 rounded-lg flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors">
                              <Upload size={16} />
                          </div>
                          <div className="text-start">
                              <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-amber-600 transition-colors block">
                                  {isRestoring ? t.restoreing : t.restoreBackup}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                  {t.fromFile}
                              </span>
                          </div>
                      </div>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".sakinnah" />

                  <button onClick={handleClearData} className="w-full flex items-center justify-between py-3 group hover:bg-white/40 dark:hover:bg-slate-700 rounded-xl transition-colors px-2">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-50/80 dark:bg-red-900/50 rounded-lg flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                              <Trash2 size={16} />
                          </div>
                          <span className="text-gray-700 dark:text-gray-200 font-medium group-hover:text-red-600 transition-colors">{t.clearData}</span>
                      </div>
                  </button>
             </div>
             
             <div className="p-4">
                 <button className="w-full flex items-center justify-between py-2 group">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-50/80 dark:bg-green-900/50 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                              <Shield size={16} />
                          </div>
                          <span className="text-gray-700 dark:text-gray-200 font-medium">{t.privacyPolicy}</span>
                      </div>
                  </button>
             </div>
          </div>

          <button onClick={onLogout} className="w-full bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors mt-auto active:scale-95 border border-red-100 dark:border-red-900/30">
              <LogOut size={20} />
              {t.logout}
          </button>
          
          <div className="text-center text-xs text-gray-400 mt-4 font-mono">v3.2.0 (Android Ready)</div>
      </main>
    </div>
  );
};

export default SettingsPage;
