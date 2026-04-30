import { createClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createClient> | null = null

// Browser client — anon key. Used only for Realtime. All reads/writes remain server-side.
export function getBrowserClient() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return client
}
