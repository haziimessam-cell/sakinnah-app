
import { Preferences } from '@capacitor/preferences';

export const StorageService = {
  async set(key: string, value: any) {
    try {
      await Preferences.set({
        key,
        value: JSON.stringify(value),
      });
    } catch (e) {
      console.error('Storage Set Error', e);
      // Fallback to localStorage for web
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const { value } = await Preferences.get({ key });
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('Storage Get Error', e);
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  },

  async remove(key: string) {
    try {
      await Preferences.remove({ key });
    } catch (e) {
      localStorage.removeItem(key);
    }
  },

  async clear() {
    try {
      await Preferences.clear();
    } catch (e) {
      localStorage.clear();
    }
  }
};
