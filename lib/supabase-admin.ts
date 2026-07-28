import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let adminInstance: SupabaseClient | null = null

/**
 * Lazily create a Supabase admin client using the service role key.
 * Only instantiated at request time, not at build time — avoids
 * `supabaseKey is required` errors during Next.js page-data collection.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    }
    adminInstance = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return adminInstance
}
