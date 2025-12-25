
import { AppNotification, ViewStateName } from '../types';

const STORAGE_KEY = 'sakinnah_notifications';

export const notificationService = {
  getNotifications(): AppNotification[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).map((n: any) => ({...n, timestamp: new Date(n.timestamp)})) : [];
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>): AppNotification {
    const notifications = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false
    };
    
    const updated = [newNotif, ...notifications].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch custom event for real-time UI updates
    window.dispatchEvent(new CustomEvent('sakinnah_new_notification', { detail: newNotif }));
    
    return newNotif;
  },

  markAsRead(id: string) {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  clearAll() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  },

  // Clinical Triggers
  triggerSensoryAlert() {
    this.addNotification({
      type: 'sensory',
      titleAr: 'تنبيه: حان وقت الهدوء',
      titleEn: 'Alert: Time for Calm',
      bodyAr: 'يبدو أنك تشعر بضغط حسي الآن. ما رأيك في الانتقال لمساحة الهدوء؟',
      bodyEn: 'You seem to be experiencing sensory pressure. How about moving to a quiet space?',
      priority: 'high',
      actionView: 'BREATHING'
    });
  },

  scheduleRoutineCheck(taskAr: string, taskEn: string, delayMinutes: number) {
    // In a real mobile app, this would use Capacitor LocalNotifications
    setTimeout(() => {
        this.addNotification({
          type: 'routine',
          titleAr: 'بطل الروتين: المهمة القادمة',
          titleEn: 'Routine Hero: Next Task',
          bodyAr: `بقي 5 دقائق لبدء: ${taskAr}. استعد!`,
          bodyEn: `5 minutes left to start: ${taskEn}. Get ready!`,
          priority: 'medium',
          actionView: 'ROUTINE_HERO'
        });
    }, delayMinutes * 60000);
  }
};
