import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"
import { getRequiredPublicEnv } from "@/lib/env"

const supabaseUrl = getRequiredPublicEnv("VITE_SUPABASE_URL")
const supabasePublishableKey = getRequiredPublicEnv(
  "VITE_SUPABASE_PUBLISHABLE_KEY",
)

const supabaseClientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
}

const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  supabaseClientOptions,
)

export { supabase }
