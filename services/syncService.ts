
import { supabase } from './supabaseClient';

// --- DATA ENCRYPTION SIMULATION (HIPAA REQUIREMENT) ---
// In a production app, use Web Crypto API (SubtleCrypto) with AES-GCM.
// For this demo, we simulate E2E encryption to show architecture.
const encryptData = (data: string): string => {
    // Placeholder: In real app, perform AES-GCM encryption here
    return btoa(unescape(encodeURIComponent(data))); 
};

const decryptData = (encrypted: string): string => {
    // Placeholder: In real app, perform AES-GCM decryption here
    try {
        return decodeURIComponent(escape(atob(encrypted)));
    } catch (e) {
        return '';
    }
};

// --- SYNC ENGINE ---

export interface SyncStatus {
    lastSync: Date | null;
    isSyncing: boolean;
    error: string | null;
}

export const syncService = {
    
    // 1. BACKUP TO FILE (Immediate Solution for User)
    createBackup: (): Blob => {
        const data: Record<string, any> = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sakinnah_')) {
                data[key] = localStorage.getItem(key);
            }
        });
        // Encrypt the entire payload
        const rawJson = JSON.stringify(data);
        const encrypted = encryptData(rawJson);
        return new Blob([encrypted], { type: 'application/sakinnah-encrypted' });
    },

    restoreBackup: async (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const encrypted = e.target?.result as string;
                    const decrypted = decryptData(encrypted);
                    const data = JSON.parse(decrypted);
                    
                    Object.keys(data).forEach(key => {
                        if (key.startsWith('sakinnah_')) {
                            localStorage.setItem(key, data[key]);
                        }
                    });
                    resolve(true);
                } catch (err) {
                    console.error("Restore failed", err);
                    resolve(false);
                }
            };
            reader.readAsText(file);
        });
    },

    // 2. CLOUD SYNC (Supabase)
    pushToCloud: async (userId: string): Promise<boolean> => {
        if (!supabase) return false;

        const data: Record<string, any> = {};
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sakinnah_')) {
                data[key] = localStorage.getItem(key);
            }
        });

        const encryptedPayload = encryptData(JSON.stringify(data));

        try {
            const { error } = await supabase
                .from('user_data')
                .upsert({ user_id: userId, data: encryptedPayload, updated_at: new Date() });
            
            return !error;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    pullFromCloud: async (userId: string): Promise<boolean> => {
        if (!supabase) return false;

        try {
            const { data, error } = await supabase
                .from('user_data')
                .select('data')
                .eq('user_id', userId)
                .single();

            if (error || !data) return false;

            const decrypted = decryptData(data.data);
            const localData = JSON.parse(decrypted);

            Object.keys(localData).forEach(key => {
                localStorage.setItem(key, localData[key]);
            });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
};
