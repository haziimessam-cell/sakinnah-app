
import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR REAL SUPABASE KEYS FROM DASHBOARD
// For security in production, always use process.env.REACT_APP_SUPABASE_URL
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
