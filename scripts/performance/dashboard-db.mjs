import { pathToFileURL } from "node:url"
import { resolve } from "node:path"
import { rolldown } from "rolldown"
import { Pool } from "pg"
import { z } from "zod"

process.loadEnvFile(process.env.PERF_ENV_FILE ?? ".env.local")
// Bundle the actual pure SQL modules, so the diagnostic cannot drift from them.
const build = await rolldown({
  input: {
    attention: "src/features/dashboard/manager/server/attention-sql.ts",
    schedule: "src/features/dashboard/manager/server/schedule-sql.ts",
  },
  platform: "node",
})
await build.write({
  dir: ".performance/sql",
  format: "esm",
  entryFileNames: "[name].mjs",
})
await build.close()
const { dashboardAttentionSql } = await import(
  pathToFileURL(resolve(".performance/sql/attention.mjs")).href
)
const { dashboardScheduleSql } = await import(
  pathToFileURL(resolve(".performance/sql/schedule.mjs")).href
)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 5000,
})
try {
  const client = await pool.connect()
  try {
    await client.query("begin read only")
    await client.query("set local statement_timeout = '10s'")
    const result = await client.query(`select organization_id, id as location_id
      from public.locations where organization_id is not null limit 1`)
    const scope = z
      .object({ organization_id: z.string(), location_id: z.string() })
      .parse(result.rows[0])
    for (let sample = 0; sample < 3; sample++) {
      for (const [operation, sql, parameters] of [
        [
          "attention",
          dashboardAttentionSql,
          [
            scope.organization_id,
            [scope.location_id],
            [scope.location_id],
            new Date().toISOString(),
            8,
            1,
            true,
          ],
        ],
        // Measures the shared schedule CTE; the outer day/arrival join is separate.
        [
          "schedule-cte",
          `with ${dashboardScheduleSql} select count(*) from schedule_windows`,
          [scope.organization_id, [scope.location_id]],
        ],
      ]) {
        const started = performance.now()
        const planResult = await client.query(
          `explain (analyze, buffers, format json) ${sql}`,
          parameters
        )
        const plan = planResult.rows[0]["QUERY PLAN"][0]
        console.log(
          JSON.stringify({
            operation,
            sample,
            roundTripMs: Math.round(performance.now() - started),
            planningMs: plan["Planning Time"],
            executionMs: plan["Execution Time"],
            sharedHits: plan.Plan["Shared Hit Blocks"],
            sharedReads: plan.Plan["Shared Read Blocks"],
          })
        )
      }
    }
    await client.query("rollback")
  } finally {
    client.release()
  }
} catch (error) {
  console.error(
    JSON.stringify({ profilingFailed: true, code: error.code ?? error.name })
  )
  process.exitCode = 1
} finally {
  await pool.end()
}
