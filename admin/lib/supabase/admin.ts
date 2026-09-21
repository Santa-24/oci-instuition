import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Enforce server-only execution
if (typeof window !== 'undefined') {
  throw new Error('Security Violation: supabaseAdmin must never be imported or executed in client-side code.');
}

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://utrusmludikyvxbmpicg.supabase.co';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  '';

let _adminClient: SupabaseClient | null = null;

/**
 * Returns the initialized administrative Supabase client.
 * Lazily instantiated on first operational call.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  if (!supabaseServiceKey) {
    throw new Error(
      'Security Exception: SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) environment variable is missing. ' +
      'Administrative database operations require a valid service role key configured in server environment variables.'
    );
  }

  _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _adminClient;
}

/**
 * Check if the service role key is configured in current environment.
 */
export function isSupabaseAdminConfigured(): boolean {
  return Boolean(supabaseServiceKey);
}

/**
 * Server-only administrative Supabase client proxy.
 * Bypasses RLS to allow full administrative CRUD across all tables.
 * Safe for build-time static imports; validates credentials on execution.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
