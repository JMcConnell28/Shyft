// @ts-check
import { databaseConnectionUrlSchema } from "./connection-url-schema.mjs"
import { supabaseDatabaseCa } from "./supabase-ca.mjs"

/**
 * Shared by server pools and plain Node diagnostics, with no plaintext fallback.
 * @param {string | undefined} connectionString
 * @returns {Pick<import("pg").PoolConfig, "connectionString" | "ssl">}
 */
function getDatabaseConnectionConfig(connectionString) {
  const parsed = databaseConnectionUrlSchema.safeParse(connectionString)
  if (!parsed.success) {
    // Never include a connection string (and its password) in config errors.
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL.")
  }
  const url = new URL(parsed.data)
  for (const [name, value] of url.searchParams) {
    if (
      (name === "sslmode" && value === "verify-full") ||
      (name === "ssl" && ["true", "1"].includes(value))
    ) {
      continue
    }
    if (name.startsWith("ssl") || name === "uselibpqcompat") {
      throw new Error(
        "DATABASE_URL cannot override verified TLS. Remove SSL parameters or use sslmode=verify-full."
      )
    }
  }
  // pg reparses URL SSL options after the explicit config. Strip the approved
  // options so they cannot replace our CA or certificate-verification policy.
  url.searchParams.delete("sslmode")
  url.searchParams.delete("ssl")
  const isSupabaseHost =
    url.hostname.endsWith(".supabase.co") ||
    url.hostname.endsWith(".pooler.supabase.com")

  return {
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
      ...(isSupabaseHost ? { ca: supabaseDatabaseCa } : {}),
    },
  }
}

export { getDatabaseConnectionConfig }
