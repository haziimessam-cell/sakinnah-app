
import { supabase } from './supabaseClient';
import { JournalEntry, Message } from '../types';

export const syncService = {
    
    // --- AUTH ---
    async getUser() {
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data) return null;
            return data.user;
        } catch (e) {
            console.warn("Auth check failed (Demo mode active)", e);
            return null;
        }
    },

    // --- JOURNALS ---
    async saveJournalEntry(entry: JournalEntry) {
        try {
            const user = await this.getUser();
            if (!user) return false;

            const { error } = await supabase
                .from('journals')
                .upsert({
                    id: entry.id, 
                    user_id: user.id,
                    content: entry.text,
                    sentiment: entry.sentiment,
                    created_at: entry.date
                }, { onConflict: 'id' });
            
            return !error;
        } catch (e) {
            console.error("Save Journal Error", e);
            return false;
        }
    },

    // --- CHAT HISTORY ---
    async saveChatSession(category: string, messages: Message[]) {
        try {
            const user = await this.getUser();
            if (!user) return false;

            const { error } = await supabase
                .from('chats')
                .upsert({
                    user_id: user.id,
                    category: category,
                    messages: messages,
                    updated_at: new Date()
                }, { onConflict: 'user_id, category' });

            return !error;
        } catch (e) {
            console.error("Save Chat Error", e);
            return false;
        }
    },

    // --- MOODS ---
    async saveMoodEntry(mood: string, value: number) {
        try {
            const user = await this.getUser();
            if (!user) return false;

            const { error } = await supabase
                .from('moods')
                .insert({
                    user_id: user.id,
                    mood: mood,
                    value: value,
                    created_at: new Date()
                });
            return !error;
        } catch (e) {
            console.error("Save Mood Error", e);
            return false;
        }
    },

    // --- SUBSCRIPTION SECURITY (Anti-Hack) ---
    async validateSubscription(username: string): Promise<boolean> {
        try {
            // 1. Try to get user from auth session first (Most Secure)
            const user = await this.getUser();
            let query = supabase.from('profiles').select('isSubscribed');
            
            if (user) {
                query = query.eq('id', user.id);
            } else {
                // Fallback to username search if auth session missing (e.g. local user only)
                query = query.eq('username', username);
            }
            
            const { data, error } = await query.single();
            
            if (error || !data) return false;
            return !!data.isSubscribed;
        } catch (e) {
            console.warn("Subscription validation failed (Network/Auth error)", e);
            return false;
        }
    },

    async upgradeSubscription(): Promise<boolean> {
        try {
            const user = await this.getUser();
            if (!user) return false;

            // Try RPC first (Secure Server-Side Logic)
            const { error } = await supabase.rpc('activate_pro_subscription', { target_user_id: user.id });
            
            if (error) {
                console.warn("RPC failed, attempting direct update (Demo Fallback)...", error.message);
                // Fallback (Only works if RLS allows update, usually blocked in Prod)
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ isSubscribed: true })
                    .eq('id', user.id);
                return !updateError;
            }
            return true;
        } catch (e) {
            console.error("Upgrade failed", e);
            return false;
        }
    },

    // --- CLOUD SYNC ENGINE ---
    async pushToCloud(username: string): Promise<boolean> {
        try {
            const user = await this.getUser();
            if (!user) return false;

            // 1. Sync Journals
            const localJournalsStr = localStorage.getItem('sakinnah_journal');
            if (localJournalsStr) {
                const entries: JournalEntry[] = JSON.parse(localJournalsStr);
                for (const entry of entries) {
                    await supabase.from('journals').upsert({
                        id: entry.id, // Ensure ID is passed to avoid dupes
                        user_id: user.id,
                        content: entry.text,
                        sentiment: entry.sentiment,
                        created_at: entry.date
                    }, { onConflict: 'id' });
                }
            }

            // 2. Sync Chats
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sakinnah_chat_')) {
                    const parts = key.split('_');
                    if (parts.length >= 4) {
                        const category = parts[2];
                        const messages = JSON.parse(localStorage.getItem(key) || '[]');
                        await this.saveChatSession(category, messages);
                    }
                }
            }

            return true;
        } catch (e) {
            console.error("Sync Push Error", e);
            return false;
        }
    },
    
    async syncWithCloud(username: string): Promise<'pushed' | 'pulled' | 'error'> {
        try {
            const user = await this.getUser();
            if (!user) return 'error';

            // 1. Pull Chats
            const { data: chats, error: chatError } = await supabase.from('chats').select('*').eq('user_id', user.id);
            if (!chatError && chats) {
                chats.forEach((chat: any) => {
                    const lang = localStorage.getItem('sakinnah_lang') || 'ar';
                    const key = `sakinnah_chat_${chat.category}_${lang}`;
                    localStorage.setItem(key, JSON.stringify(chat.messages));
                });
            }

            // 2. Pull Journals
            const { data: journals, error: journalError } = await supabase.from('journals').select('*').eq('user_id', user.id);
            if (!journalError && journals) {
                const mappedJournals: JournalEntry[] = journals.map((j: any) => ({
                    id: j.id || Date.now().toString(),
                    date: j.created_at,
                    text: j.content,
                    tags: [],
                    sentiment: j.sentiment
                }));
                localStorage.setItem('sakinnah_journal', JSON.stringify(mappedJournals));
            }

            // 3. Pull Mood History
            const { data: moods, error: moodError } = await supabase.from('moods').select('*').eq('user_id', user.id).order('created_at', {ascending: true});
            if (!moodError && moods) {
                const moodHistory = moods.map((m: any) => ({
                    value: m.value,
                    date: m.created_at,
                    mood: m.mood
                }));
                localStorage.setItem('sakinnah_mood_history', JSON.stringify(moodHistory));
            }

            // 4. Validate Subscription Status
            const isSubscribed = await this.validateSubscription(username);
            return 'pulled';
        } catch (e) {
            console.error("Sync Pull Error", e);
            return 'error';
        }
    },

    // --- BACKUP & RESTORE (FILE) ---
    createBackup: (): Blob => {
        const backupData: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sakinnah_')) {
                const value = localStorage.getItem(key);
                if (value) backupData[key] = value;
            }
        }
        const jsonString = JSON.stringify(backupData);
        return new Blob([jsonString], { type: 'application/json' });
    },

    restoreBackup: async (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonString = e.target?.result as string;
                    const backupData = JSON.parse(jsonString);
                    if (typeof backupData !== 'object' || backupData === null) {
                        resolve(false);
                        return;
                    }
                    Object.keys(backupData).forEach(key => {
                        if (key.startsWith('sakinnah_')) {
                            localStorage.setItem(key, backupData[key]);
                        }
                    });
                    resolve(true);
                } catch (error) {
                    console.error("Backup restore failed", error);
                    resolve(false);
                }
            };
            reader.onerror = () => resolve(false);
            reader.readAsText(file);
        });
    }
};
