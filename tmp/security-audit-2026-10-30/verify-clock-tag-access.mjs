import { readFile, readdir } from "node:fs/promises"
import { Client } from "pg"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

process.loadEnvFile(".env.local")
const client = new Client({
  ...getDatabaseConnectionConfig(process.env.DATABASE_URL),
  connectionTimeoutMillis: 10000,
  statement_timeout: 15000,
})
await client.connect()
try {
  await client.query("begin")
  await client.query("set local lock_timeout = '5s'")
  if (process.argv.includes("--preview")) {
    // Include historical column grants in the test: a table-level revoke alone
    // must not accidentally leave a column-only route to key material.
    await client.query("grant select(ntag_aes_key_hex), update(ntag_aes_key_hex) on public.clock_tags to anon, authenticated")
    const files = await readdir("supabase/migrations")
    const migration = files.find((file) => file.endsWith("_restrict_clock_tag_browser_access.sql"))
    if (!migration) throw new Error("S02 migration was not found.")
    await client.query(await readFile(`supabase/migrations/${migration}`, "utf8"))
  }
  const result = await client.query(await readFile("supabase/tests/clock_tag_access.sql", "utf8"))
  console.log(JSON.stringify({ mode: process.argv.includes("--preview") ? "migration-preview" : "hosted-verification", results: result.map((item) => item.rows), rolledBack: true }))
} finally {
  await client.query("rollback")
  await client.end()
}
