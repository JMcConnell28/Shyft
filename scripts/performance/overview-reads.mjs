import { Pool } from "pg"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

process.loadEnvFile(process.env.PERF_ENV_FILE ?? ".env.local")
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 5000,
})
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
)
const scopeSchema = z.object({
  organization_id: z.string(),
  location_id: z.string(),
  user_id: z.string(),
})
try {
  const result = await pool.query(`select m."organizationId" as organization_id,
    m."userId" as user_id, l.id as location_id from public.member m
    join public.locations l on l.organization_id = m."organizationId" limit 1`)
  const scope = scopeSchema.parse(result.rows[0])
  for (let sample = 0; sample < 3; sample++) {
    const started = performance.now()
    const rotas = await supabase
      .from("rotas")
      .select("id, location_id, published_by_user_id, published_version")
      .eq("status", "published")
      .eq("organization_id", scope.organization_id)
      .in("location_id", [scope.location_id])
    if (rotas.error) throw rotas.error
    const ids = z
      .array(z.object({ id: z.string() }))
      .parse(rotas.data)
      .map((row) => row.id)
    const rotasAt = performance.now()
    if (ids.length) {
      const reads = await supabase
        .from("rota_reads")
        .select("rota_id, seen_published_version")
        .eq("user_id", scope.user_id)
        .in("rota_id", ids)
      if (reads.error) throw reads.error
    }
    console.log(
      JSON.stringify({
        sample,
        rotasMs: Math.round(rotasAt - started),
        readsMs: Math.round(performance.now() - rotasAt),
        removedSequentialMs: Math.round(performance.now() - started),
        note: "Isolated redundant reads; excludes permissions and useful overview queries",
      })
    )
  }
} catch (error) {
  console.error(
    JSON.stringify({ profilingFailed: true, code: error.code ?? error.name })
  )
  process.exitCode = 1
} finally {
  await pool.end()
}
