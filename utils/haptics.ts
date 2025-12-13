
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const haptics = {
  impact: async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      await Haptics.impact({ style });
    } catch (e) {
      // Fallback for web
      if (navigator.vibrate) navigator.vibrate(style === ImpactStyle.Heavy ? 20 : 10);
    }
  },
  
  notification: async (type: NotificationType = NotificationType.Success) => {
    try {
      await Haptics.notification({ type });
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate([50, 50]);
    }
  },
  
  vibrate: async () => {
    try {
      await Haptics.vibrate();
    } catch (e) {
      if (navigator.vibrate) navigator.vibrate(200);
    }
  }
};
