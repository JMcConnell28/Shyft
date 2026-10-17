import "@tanstack/react-start/server-only"

import { createClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/database.types"
import { getRequiredEnv } from "@/lib/env.server"
import { timeServerOperation } from "@/lib/server-timing"

const supabaseServerClientOptions = {
  global: {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      timeServerOperation("supabase", () => fetch(input, init)),
  },
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
    supabaseServerClientOptions
  )
}

export { createSupabaseServerClient }
