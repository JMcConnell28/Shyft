import { TLSSocket } from "node:tls"
import { Pool } from "pg"
import { z } from "zod"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

const backendTlsSchema = z.object({
  ssl: z.boolean(),
  tls_version: z.string().nullable(),
})

async function verifyDatabaseTls() {
  if (process.argv[2]) process.loadEnvFile(process.argv[2])
  const pool = new Pool({
    ...getDatabaseConnectionConfig(process.env.DATABASE_URL),
    max: 1,
    connectionTimeoutMillis: 10000,
  })
  try {
    const client = await pool.connect()
    try {
      const socket = client.connection.stream
      if (
        !(socket instanceof TLSSocket) ||
        !socket.encrypted ||
        !socket.authorized
      ) {
        throw new Error(
          "The database client is not using certificate-verified TLS."
        )
      }
      const { rows } = await client.query(
        "select ssl, version as tls_version from pg_stat_ssl where pid = pg_backend_pid()"
      )
      const backend = backendTlsSchema.parse(rows[0])
      console.log(
        JSON.stringify(
          {
            client: {
              encrypted: true,
              certificateVerified: true,
              protocol: socket.getProtocol(),
            },
            // Through Supavisor this describes the separate pooler-to-Postgres hop.
            databaseBackend: {
              encrypted: backend.ssl,
              protocol: backend.tls_version,
            },
          },
          null,
          2
        )
      )
      if (!backend.ssl) {
        throw new Error(
          "The database backend hop is not encrypted. Complete the Supabase SSL-enforcement rollout."
        )
      }
    } finally {
      client.release()
    }
  } finally {
    await pool.end()
  }
}

verifyDatabaseTls().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "TLS verification failed."
  )
  process.exitCode = 1
})
