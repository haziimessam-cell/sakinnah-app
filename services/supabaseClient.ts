
import { createClient } from '@supabase/supabase-js';

// Helper to get env vars in both Process (Node/CRA) and Import.Meta (Vite) environments safely
const getEnv = (key: string, viteKey: string) => {
    if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key];
    try {
        // Cast to any to avoid TS errors if types aren't generated
        if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[viteKey]) return (import.meta as any).env[viteKey];
    } catch (e) { }
    return undefined;
};

const configuredUrl = getEnv('REACT_APP_SUPABASE_URL', 'VITE_SUPABASE_URL');
const configuredKey = getEnv('REACT_APP_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

// Use placeholders if not configured to prevent crash on initialization.
// The isSupabaseConfigured function will let the app know if it should attempt network calls.
const supabaseUrl = (configuredUrl || 'https://placeholder.supabase.co').trim();
const supabaseKey = (configuredKey || 'placeholder-key').trim();

export const isSupabaseConfigured = () => {
    return !!configuredUrl && !!configuredKey && 
           !supabaseUrl.includes('YOUR_PROJECT_ID') && 
           !supabaseUrl.includes('placeholder');
};

export const supabase = createClient(supabaseUrl, supabaseKey);
