
import React, { useRef, useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { ArrowRight, ArrowLeft, Bell, Moon, Trash2, Shield, LogOut, Globe, Download, Cloud, Upload, FileJson, CheckCircle } from 'lucide-react';
import { syncService } from '../services/syncService';

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
      if(confirm(language === 'ar' ? 'هل تريد رفع بياناتك إلى السحابة الآن؟' : 'Sync data to cloud now?')) {
          const success = await syncService.pushToCloud(user.username);
          if (success) alert(language === 'ar' ? 'تمت المزامنة بنجاح!' : 'Sync successful!');
          else alert(language === 'ar' ? 'فشلت المزامنة. تأكد من اتصالك.' : 'Sync failed. Check connection.');
      }
  };

  // Enhanced Backup (File)
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

  // Restore
  const handleRestoreClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (window.confirm(language === 'ar' ? 'استعادة النسخة الاحتياطية سيستبدل البيانات الحالية. هل أنت متأكد؟' : 'Restoring will overwrite current data. Continue?')) {
          setIsRestoring(true);
          const success = await syncService.restoreBackup(file);
          setIsRestoring(false);
          
          if (success) {
              alert(language === 'ar' ? 'تمت الاستعادة بنجاح! سيتم إعادة تحميل التطبيق.' : 'Restore successful! App will reload.');
              window.location.reload();
          } else {
              alert(language === 'ar' ? 'فشل الملف. تأكد من أنه ملف سكينة صالح.' : 'Invalid file format.');
          }
      }
  };

  return (
    <div className="h-full bg-transparent flex flex-col pt-safe pb-safe animate-fadeIn">
      <header className="bg-white/40 backdrop-blur-xl px-4 py-4 shadow-sm sticky top-0 z-10 flex items-center gap-3 border-b border-white/20">
         <button onClick={onBack} className="p-2 hover:bg-white/60 rounded-full transition-colors border border-transparent hover:border-white/40">
             {isRTL ? <ArrowRight size={24} className="text-gray-600" /> : <ArrowLeft size={24} className="text-gray-600" />}
         </button>
         <h1 className="text-xl font-bold text-gray-900">{t.settings}</h1>
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
                      <h3 className="font-bold text-lg">{language === 'ar' ? 'المزامنة السحابية' : 'Cloud Sync'}</h3>
                      <p className="text-blue-100 text-xs flex items-center gap-1">
                          <Shield size={10} /> 
                          {language === 'ar' ? 'مشفر طرف-إلى-طرف (HIPAA)' : 'End-to-End Encrypted (HIPAA)'}
                      </p>
                  </div>
              </div>

              {/* Sync Action */}
              <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                   <div className="text-xs text-blue-100">
                       {language === 'ar' ? 'الحالة: نشط' : 'Status: Active'}
                   </div>
                   <button onClick={handleSyncPush} className="bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors">
                       {language === 'ar' ? 'مزامنة الآن' : 'Sync Now'}
                   </button>
              </div>
          </div>

          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl shadow-sm border border-white/50 overflow-hidden">
               {/* Language Setting */}
               <div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50/80 rounded-full flex items-center justify-center text-teal-600">
                          <Globe size={20} />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800">Language / اللغة</h3>
                      </div>
                  </div>
                  <button 
                    onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    {language === 'ar' ? 'العربية' : 'English'}
                  </button>
              </div>

              <div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50/80 rounded-full flex items-center justify-center text-blue-600">
                          <Bell size={20} />
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800">{t.notifications}</h3>
                          <p className="text-xs text-gray-500">{t.notificationsDesc}</p>
                      </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
              </div>
          </div>

          <div className="bg-white/60 backdrop-blur-2xl rounded-2xl shadow-sm border border-white/50 overflow-hidden">
             <div className="p-4 border-b border-gray-100/50">
                  <h3 className="text-sm font-bold text-gray-500 mb-4">{t.privacyData}</h3>
                  
                  {/* BACKUP BUTTON */}
                  <button onClick={handleBackup} className="w-full flex items-center justify-between py-3 group mb-2 hover:bg-white/40 rounded-xl transition-colors px-2">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-50/80 rounded-lg flex items-center justify-center text-emerald-500 group-hover:bg-emerald-100 transition-colors">
                              <Download size={16} />
                          </div>
                          <div className="text-start">
                              <span className="text-gray-700 font-medium group-hover:text-emerald-600 transition-colors block">
                                  {language === 'ar' ? 'نسخ احتياطي (ملف)' : 'Backup to File'}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                  {lastBackup ? (language === 'ar' ? 'تم الحفظ مؤخراً' : 'Last saved just now') : (language === 'ar' ? 'حفظ نسخة مشفرة' : 'Save encrypted copy')}
                              </span>
                          </div>
                      </div>
                  </button>
                  
                  {/* RESTORE BUTTON */}
                  <button onClick={handleRestoreClick} className="w-full flex items-center justify-between py-3 group mb-2 hover:bg-white/40 rounded-xl transition-colors px-2">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-50/80 rounded-lg flex items-center justify-center text-amber-500 group-hover:bg-amber-100 transition-colors">
                              <Upload size={16} />
                          </div>
                          <div className="text-start">
                              <span className="text-gray-700 font-medium group-hover:text-amber-600 transition-colors block">
                                  {isRestoring ? (language === 'ar' ? 'جاري الاستعادة...' : 'Restoring...') : (language === 'ar' ? 'استعادة نسخة' : 'Restore Backup')}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                  {language === 'ar' ? 'من ملف .sakinnah' : 'From .sakinnah file'}
                              </span>
                          </div>
                      </div>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".sakinnah" />

                  <button onClick={handleClearData} className="w-full flex items-center justify-between py-3 group hover:bg-white/40 rounded-xl transition-colors px-2">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-50/80 rounded-lg flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                              <Trash2 size={16} />
                          </div>
                          <span className="text-gray-700 font-medium group-hover:text-red-600 transition-colors">{t.clearData}</span>
                      </div>
                  </button>
             </div>
             
             <div className="p-4">
                 <button className="w-full flex items-center justify-between py-2 group">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-50/80 rounded-lg flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                              <Shield size={16} />
                          </div>
                          <span className="text-gray-700 font-medium">{t.privacyPolicy}</span>
                      </div>
                  </button>
             </div>
          </div>

          <button onClick={onLogout} className="w-full bg-red-50/80 backdrop-blur-md text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors mt-auto active:scale-95 border border-red-100">
              <LogOut size={20} />
              {t.logout}
          </button>
          
          <div className="text-center text-xs text-gray-400 mt-4 font-mono">v3.0.0 (Cloud Ready)</div>
      </main>
    </div>
  );
};

export default SettingsPage;
