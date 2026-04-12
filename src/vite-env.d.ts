/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_BYPASS_EMAIL_VERIFICATION: string
  readonly VITE_SUPABASE_KEY: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_SUPABASE_URL: string
}
