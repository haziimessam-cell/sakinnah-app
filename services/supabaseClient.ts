
import { createClient } from '@supabase/supabase-js';

// These should be environmental variables in a real production build.
// Since we are in a demo environment, these placeholders allow the code to compile
// but will fail gracefully if not populated.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch (e) {
        console.warn('Supabase client failed to initialize', e);
    }
}

export { supabase };
