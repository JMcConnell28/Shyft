import type { PostgrestError } from "@supabase/supabase-js"

function assertSupabaseSuccess(
  error: PostgrestError | null,
  message: string,
): void {
  if (error) {
    throw new Error(message, { cause: error })
  }
}

function getRequiredSupabaseRow<T>(row: T | null, message: string): T {
  if (!row) {
    throw new Error(message)
  }

  return row
}

export { assertSupabaseSuccess, getRequiredSupabaseRow }
