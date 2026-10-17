import { Pool } from "pg"

// Read-only, local diagnostic. Never print connection strings, parameters or rows.
process.loadEnvFile(".env.local")
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  max: 1,
})

function summarizeNodes(node) {
  return [
    {
      type: node["Node Type"],
      index: node["Index Name"],
      rows: node["Actual Rows"],
    },
    ...(node.Plans ?? []).flatMap(summarizeNodes),
  ]
}

try {
  const roundTrips = []
  for (let index = 0; index < 5; index++) {
    const startedAt = performance.now()
    await pool.query("select 1")
    roundTrips.push(Math.round(performance.now() - startedAt))
  }
  console.log(
    JSON.stringify({
      connectionAndFirstQueryMs: roundTrips[0],
      repeatRoundTripMs: roundTrips.slice(1),
    })
  )
  const client = await pool.connect()
  try {
    await client.query("begin read only")
    await client.query("set local statement_timeout = '5s'")
    const scope = await client.query(
      `select o.id as organization_id, m."userId" as user_id, l.id as location_id
       from public.organization o
       join public.member m on m."organizationId" = o.id
       join public.locations l on l.organization_id = o.id
       where ($1::text is null or o.slug = $1) limit 1`,
      [process.argv[2] ?? null]
    )
    const row = scope.rows[0]
    if (!row) throw new Error("No workspace available to profile")
    const plans = [
      [
        "membership",
        'select role from public.member where "organizationId" = $1 and "userId" = $2',
        [row.organization_id, row.user_id],
      ],
      [
        "locations",
        "select id from public.locations where organization_id = $1 order by created_at, name",
        [row.organization_id],
      ],
      [
        "rota-week",
        "select id from public.rotas where organization_id = $1 and location_id = $2::uuid order by week_start desc",
        [row.organization_id, row.location_id],
      ],
      [
        "assigned-employees",
        "select employee_id from public.employee_location_assignments where organization_id = $1 and location_id = $2::uuid and is_enabled = true and disabled_at is null",
        [row.organization_id, row.location_id],
      ],
    ]
    for (const [operation, sql, parameters] of plans) {
      const result = await client.query(
        `explain (analyze, buffers, format json) ${sql}`,
        parameters
      )
      const plan = result.rows[0]["QUERY PLAN"][0]
      console.log(
        JSON.stringify({
          operation,
          planningMs: plan["Planning Time"],
          executionMs: plan["Execution Time"],
          nodes: summarizeNodes(plan.Plan),
        })
      )
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
