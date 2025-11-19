import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const resolvedSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resolvedSupabaseSecretKey = serviceRoleKey ?? anonKey;

if (!resolvedSupabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable for server client');
}

if (!resolvedSupabaseSecretKey) {
  throw new Error('Missing Supabase service or anon key for server client');
}

const supabaseUrl: string = resolvedSupabaseUrl;
const supabaseSecretKey: string = resolvedSupabaseSecretKey;

let cachedClient: SupabaseClient<Database> | null = null;

export function createServerSupabaseClient() {
  if (!cachedClient) {
    const client = createClient<Database>(supabaseUrl, supabaseSecretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
    }) as unknown as SupabaseClient<Database>;
    cachedClient = client;
  }

  return cachedClient;
}
