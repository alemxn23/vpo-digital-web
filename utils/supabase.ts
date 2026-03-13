import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: any = null;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.error('Failed to initialize Supabase:', e);
    }
} else {
    console.warn('Supabase VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.');
}

export const supabase = supabaseInstance;
