
import { supabase } from './supabaseClient';
import { JournalEntry, Message } from '../types';

export const syncService = {
    
    // --- AUTH ---
    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    // --- JOURNALS ---
    async saveJournalEntry(entry: JournalEntry) {
        const user = await this.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('journals')
            .upsert({
                id: entry.id, // Use local ID to prevent dupes if UUID compatible, else let Supabase gen
                user_id: user.id,
                content: entry.text,
                sentiment: entry.sentiment,
                created_at: entry.date
            }, { onConflict: 'id' });
        
        return !error;
    },

    // --- CHAT HISTORY ---
    async saveChatSession(category: string, messages: Message[]) {
        const user = await this.getUser();
        if (!user) return false;

        // Upsert chat session
        const { error } = await supabase
            .from('chats')
            .upsert({
                user_id: user.id,
                category: category,
                messages: messages, // Supabase handles JSONB
                updated_at: new Date()
            }, { onConflict: 'user_id, category' }); // Requires unique constraint on (user_id, category) in DB

        return !error;
    },

    // --- MOODS ---
    async saveMoodEntry(mood: string, value: number) {
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
    },

    // --- CLOUD SYNC ENGINE ---
    async pushToCloud(username: string): Promise<boolean> {
        const user = await this.getUser();
        if (!user) return false;

        try {
            // 1. Sync Journals
            const localJournalsStr = localStorage.getItem('sakinnah_journal');
            if (localJournalsStr) {
                const entries: JournalEntry[] = JSON.parse(localJournalsStr);
                // We upsert all to ensure cloud is up to date
                for (const entry of entries) {
                    await supabase.from('journals').upsert({
                        user_id: user.id,
                        content: entry.text,
                        sentiment: entry.sentiment,
                        created_at: entry.date
                    });
                }
            }

            // 2. Sync Chats
            // Iterate over all keys in localStorage to find chats
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('sakinnah_chat_')) {
                    // key format: sakinnah_chat_CATEGORY_LANG
                    const parts = key.split('_');
                    if (parts.length >= 4) {
                        const category = parts[2];
                        const messages = JSON.parse(localStorage.getItem(key) || '[]');
                        await this.saveChatSession(category, messages);
                    }
                }
            }

            // 3. Sync Moods (Optimistic - just push new ones if we tracked ID, but for now just push latest logic or skip bulk sync to avoid dupes if not tracked. 
            // Better strategy: The app pushes immediately on creation. This generic push is a fallback.)
            
            return true;
        } catch (e) {
            console.error("Sync Push Error", e);
            return false;
        }
    },
    
    async syncWithCloud(username: string): Promise<'pushed' | 'pulled' | 'error'> {
        const user = await this.getUser();
        if (!user) return 'error';

        try {
            // 1. Pull Chats
            const { data: chats } = await supabase.from('chats').select('*').eq('user_id', user.id);
            if (chats) {
                chats.forEach((chat: any) => {
                    // Determine language from local setting or default to 'ar'
                    const lang = localStorage.getItem('sakinnah_lang') || 'ar';
                    const key = `sakinnah_chat_${chat.category}_${lang}`;
                    
                    // Simple merge: if cloud is newer or local is empty, overwrite
                    // For a robust app, we'd merge message arrays by ID.
                    localStorage.setItem(key, JSON.stringify(chat.messages));
                });
            }

            // 2. Pull Journals
            const { data: journals } = await supabase.from('journals').select('*').eq('user_id', user.id);
            if (journals) {
                const mappedJournals: JournalEntry[] = journals.map((j: any) => ({
                    id: j.id || Date.now().toString(),
                    date: j.created_at,
                    text: j.content,
                    tags: [],
                    sentiment: j.sentiment
                }));
                localStorage.setItem('sakinnah_journal', JSON.stringify(mappedJournals));
            }

            // 3. Pull Mood History for Chart
            const { data: moods } = await supabase.from('moods').select('*').eq('user_id', user.id).order('created_at', {ascending: true});
            if (moods) {
                const moodHistory = moods.map((m: any) => ({
                    value: m.value,
                    date: m.created_at,
                    mood: m.mood
                }));
                localStorage.setItem('sakinnah_mood_history', JSON.stringify(moodHistory));
            }

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
