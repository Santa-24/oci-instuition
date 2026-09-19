import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

let supabaseClient = null;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_SECRET_KEY) {
    console.warn('[Supabase Config Warning] SUPABASE_URL or SUPABASE_SECRET_KEY not set. Operating in fallback mock mode.');
    return null;
  }

  supabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}
