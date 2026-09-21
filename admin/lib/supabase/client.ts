import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://utrusmludikyvxbmpicg.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cnVzbWx1ZGlreXZ4Ym1waWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MTU5NDIsImV4cCI6MjEwNTM5MTk0Mn0.20AbTQrc6FY0lIiS79u1_jMsLfFoH9AKCb1QvzfuVSU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});

export const getSupabaseClient = () => supabase;

