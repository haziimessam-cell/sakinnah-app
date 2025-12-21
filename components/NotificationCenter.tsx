
import React, { useState, useEffect } from 'react';
import { Language, AppNotification, ViewStateName } from '../types';
import { translations } from '../translations';
import { X, Bell, Trash2, Sparkles, Sprout, Brain, Clock, ArrowRight, ToggleLeft, ToggleRight, Moon } from 'lucide-react';

interface Props {
  language: Language;
  onClose: () => void;
  onNavigate: (view: ViewStateName) => void;
}

const NotificationCenter: React.FC<Props> = ({ language, onClose, onNavigate }) => {
  const t = translations[language] as any;
  const isRTL = language === 'ar';
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    // محاكاة تحميل الإشعارات من التخزين المحلي
    const mockNotifs: AppNotification[] = [
      {
        id: '1',
        type: 'insight',
        titleAr: 'بصيرة من سكينة',
        titleEn: 'Insight from Sakinnah',
        bodyAr: 'لاحظت أن توترك يزداد في المساء، هل نجرّب تمرين تنفس الآن؟',
        bodyEn: 'I noticed your tension increases in the evening, shall we try a breathing exercise?',
        timestamp: new Date(),
        isRead: false,
        actionView: 'BREATHING'
      },
      {
        id: '2',
        type: 'garden',
        titleAr: 'حديقتك تناديك',
        titleEn: 'Your Garden Calls',
        bodyAr: 'لقد مرت 24 ساعة منذ آخر مرة رويت فيها روحك. الزهور تنتظرك.',
        bodyEn: 'It has been 24 hours since you last watered your soul. The flowers are waiting.',
        timestamp: new Date(Date.now() - 3600000),
        isRead: true,
        actionView: 'GARDEN'
      }
    ];
    setNotifications(mockNotifs);
    setZenMode(localStorage.getItem('sakinnah_zen_mode') === 'true');
  }, []);

  const toggleZen = () => {
    const newState = !zenMode;
    setZenMode(newState);
    localStorage.setItem('sakinnah_zen_mode', newState.toString());
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'insight': return <Brain className="text-indigo-500" size={20} />;
      case 'garden': return <Sprout className="text-emerald-500" size={20} />;
      case 'reminder': return <Clock className="text-amber-500" size={20} />;
      default: return <Bell className="text-primary-500" size={20} />;
    }
  };

  const clearAll = () => {
    setNotifications([]);
    if (navigator.vibrate) navigator.vibrate([10, 10]);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50/95 backdrop-blur-2xl flex flex-col pt-safe animate-fadeIn overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl -z-10"></div>

        <header className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={onClose} className="p-2 bg-white rounded-xl shadow-sm text-slate-500 border border-slate-100">
                    <X size={20} />
                </button>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">{t.notificationCenter}</h1>
            </div>
            {notifications.length > 0 && (
                <button onClick={clearAll} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                </button>
            )}
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {/* Zen Mode Toggle */}
            <div className="bg-white/60 p-5 rounded-[2rem] border border-white shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${zenMode ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Moon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{t.zenMode}</h3>
                        <p className="text-[10px] text-slate-400 max-w-[180px]">{t.zenModeDesc}</p>
                    </div>
                </div>
                <button onClick={toggleZen} className="text-indigo-500">
                    {zenMode ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-slate-300" />}
                </button>
            </div>

            <div className="space-y-3">
                {notifications.length > 0 ? (
                    notifications.map((notif, idx) => (
                        <div 
                          key={notif.id} 
                          className={`bg-white rounded-3xl p-5 border shadow-sm transition-all hover:shadow-md animate-reveal flex gap-4 ${notif.isRead ? 'border-slate-100 opacity-80' : 'border-primary-100 shadow-primary-500/5'}`}
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100">
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-black text-slate-800 text-sm">{isRTL ? notif.titleAr : notif.titleEn}</h4>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase">{notif.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                    {isRTL ? notif.bodyAr : notif.bodyEn}
                                </p>
                                {notif.actionView && (
                                    <button 
                                      onClick={() => { onNavigate(notif.actionView!); onClose(); }} 
                                      className="mt-3 flex items-center gap-1.5 text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100 transition-all"
                                    >
                                        <Sparkles size={12} />
                                        {t.goToAction}
                                        <ArrowRight size={12} className={isRTL ? 'rotate-180' : ''} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                        <Bell size={64} className="text-slate-300 mb-4" />
                        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">{t.noNotifications}</p>
                    </div>
                )}
            </div>
        </main>

        <footer className="p-8 text-center bg-white/40 border-t border-slate-100">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Sakinnah Smart Alert System v2.0</p>
        </footer>
    </div>
  );
};

export default NotificationCenter;
