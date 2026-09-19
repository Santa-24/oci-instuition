import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://utrusmludikyvxbmpicg.supabase.co';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0cnVzbWx1ZGlreXZ4Ym1waWNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTgxNTk0MiwiZXhwIjoyMTA1MzkxOTQyfQ.SS4mdzmT_3DO4Lz0gVYPRfT6apJEfMVpPpHYVOo3iLc';

/**
 * Server-only administrative Supabase client.
 * Bypasses RLS to allow full administrative CRUD across all tables.
 * NEVER import this into client components ('use client').
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
