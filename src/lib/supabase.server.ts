import "@tanstack/react-start/server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"
import { getRequiredEnv } from "@/lib/env.server"

const supabaseServerClientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
}

function createSupabaseServerClient() {
  return createClient<Database>(
    getRequiredEnv("VITE_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SECRET_KEY"),
    supabaseServerClientOptions,
  )
}

export { createSupabaseServerClient }
