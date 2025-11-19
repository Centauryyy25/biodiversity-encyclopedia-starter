import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Lean client: only Supabase, no Stripe; prefers service role if available (for server-side reads),
// falls back to anon for read-only environments.
const supabaseLeanKey = serviceRoleKey ?? anonKey

export const hasServiceRole = Boolean(serviceRoleKey)
export const supabaseLean = createClient<Database>(supabaseUrl, supabaseLeanKey)
