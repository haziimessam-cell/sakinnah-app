
import React, { useState, useEffect } from 'react';
import { Language, AppNotification, ViewStateName } from '../types';
import { translations } from '../translations';
import { notificationService } from '../services/notificationService';
import { 
    X, Bell, Trash2, Sparkles, Sprout, Brain, 
    Clock, ArrowRight, ToggleLeft, ToggleRight, 
    Moon, ShieldAlert, Trophy, Zap, Info 
} from 'lucide-react';

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

  const loadNotifications = () => {
    setNotifications(notificationService.getNotifications());
  };

  useEffect(() => {
    loadNotifications();
    setZenMode(localStorage.getItem('sakinnah_zen_mode') === 'true');
    
    const handler = () => loadNotifications();
    window.addEventListener('sakinnah_new_notification', handler);
    return () => window.removeEventListener('sakinnah_new_notification', handler);
  }, []);

  const toggleZen = () => {
    const newState = !zenMode;
    setZenMode(newState);
    localStorage.setItem('sakinnah_zen_mode', newState.toString());
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'insight': return <Brain className="text-indigo-500" size={20} />;
      case 'garden': return <Sprout className="text-emerald-500" size={20} />;
      case 'routine': return <Clock className="text-amber-500" size={20} />;
      case 'sensory': return <ShieldAlert className="text-red-500" size={20} />;
      case 'achievement': return <Trophy className="text-yellow-500" size={20} />;
      case 'alert': return <Zap className="text-orange-500" size={20} />;
      default: return <Bell className="text-ios-azure" size={20} />;
    }
  };

  const handleClearAll = () => {
    notificationService.clearAll();
    loadNotifications();
    if (navigator.vibrate) navigator.vibrate([10, 10]);
  };

  const handleAction = (notif: AppNotification) => {
    notificationService.markAsRead(notif.id);
    if (notif.actionView) onNavigate(notif.actionView);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex flex-col pt-safe animate-ios-reveal overflow-hidden">
        <header className="px-6 py-6 border-b border-ios-azure/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-3 bg-ios-slate rounded-2xl text-ios-azure transition-all active:scale-90">
                    <X size={20} />
                </button>
                <h1 className="text-2xl font-bold text-ios-azureDeep tracking-tight">{isRTL ? 'مركز التنبيهات' : 'Notifications'}</h1>
            </div>
            {notifications.length > 0 && (
                <button onClick={handleClearAll} className="p-3 text-ios-azure/40 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                </button>
            )}
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
            {/* Zen Mode Feature */}
            <div className="ios-card p-6 flex items-center justify-between bg-ios-azureDeep text-white border-none">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${zenMode ? 'bg-ios-azure text-white' : 'bg-white/10 text-white/40'}`}>
                        <Moon size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[17px]">{isRTL ? 'وضع السكون (Zen)' : 'Zen Mode'}</h3>
                        <p className="text-[12px] text-white/60 font-medium">{isRTL ? 'إيقاف التنبيهات غير الضرورية' : 'Silence non-essential alerts'}</p>
                    </div>
                </div>
                <button onClick={toggleZen}>
                    {zenMode ? <ToggleRight size={44} className="text-ios-azure" /> : <ToggleLeft size={44} className="text-white/20" />}
                </button>
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notif, idx) => (
                        <div 
                          key={notif.id} 
                          onClick={() => handleAction(notif)}
                          className={`ios-card p-5 border flex gap-4 transition-all active:scale-95 group ${notif.isRead ? 'opacity-50 grayscale' : 'border-ios-azure/10 shadow-ios-azure/5'}`}
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <div className="w-14 h-14 bg-ios-slate rounded-[20px] flex items-center justify-center shrink-0">
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-ios-azureDeep text-[16px]">{isRTL ? notif.titleAr : notif.titleEn}</h4>
                                    <span className="text-[10px] font-black text-ios-azure/30 uppercase tracking-tighter">
                                        {notif.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {hour:'2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <p className="text-[14px] text-ios-azure/60 leading-snug font-medium mb-3">
                                    {isRTL ? notif.bodyAr : notif.bodyEn}
                                </p>
                                {notif.actionView && (
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-ios-azure uppercase tracking-widest">
                                        <span>{isRTL ? 'اتخاذ إجراء' : 'Take Action'}</span>
                                        <ArrowRight size={14} className={isRTL ? 'rotate-180' : ''} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
                        <div className="w-24 h-24 bg-ios-slate rounded-full flex items-center justify-center text-ios-azure/20">
                            <Bell size={48} />
                        </div>
                        <p className="font-bold text-ios-azure/30 uppercase tracking-[0.3em] text-[11px]">{isRTL ? 'لا توجد تنبيهات حالياً' : 'All Clear for Now'}</p>
                    </div>
                )}
            </div>
        </main>

        <footer className="p-10 text-center border-t border-ios-azure/5">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-ios-azure/30 uppercase tracking-[0.4em]">
                <ShieldAlert size={12} />
                <span>Sakinnah Intelligence Mesh v3.1</span>
            </div>
        </footer>
    </div>
  );
};

export default NotificationCenter;
