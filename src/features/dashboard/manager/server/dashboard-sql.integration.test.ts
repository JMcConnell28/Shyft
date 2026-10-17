import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest"
import { Pool } from "pg"
import { z } from "zod"
import { dashboardAttentionSql } from "./attention-sql"
import { dashboardScheduleSql } from "./schedule-sql"
import { timestampSchema } from "./record-schemas"
import {
  sqlFixtureIds as ids,
  inTemporarySchema,
  seedDashboardSqlFixtures,
} from "./sql-test-fixtures"
// eslint-disable-next-line no-duplicate-imports
import type { PoolClient } from "pg"

const pageSchema = z.object({
  total: z.number(),
  items: z.array(
    z.object({ id: z.string(), kind: z.string(), location_id: z.string() })
  ),
})

describe.skipIf(!process.env.DATABASE_URL)(
  "dashboard SQL against isolated Postgres fixtures",
  () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 15000,
    })
    let client: PoolClient
    beforeAll(async () => {
      client = await pool.connect()
    })
    beforeEach(async () => {
      await client.query("begin")
      await seedDashboardSqlFixtures(client)
    })
    afterEach(async () => {
      await client.query("rollback")
    })
    afterAll(async () => {
      client.release()
      await pool.end()
    })

    async function attention(
      now: string,
      page = 1,
      locationIds = [ids.location],
      size = 8
    ) {
      const result = await client.query(
        inTemporarySchema(dashboardAttentionSql),
        [
          "org-dashboard-test",
          locationIds,
          [ids.location],
          now,
          size,
          page,
          true,
        ]
      )
      return pageSchema.parse(result.rows[0])
    }
    async function windows() {
      const result = await client.query(
        inTemporarySchema(
          `with ${dashboardScheduleSql} select segment, starts_at, ends_at from schedule_windows order by starts_at`
        ),
        ["org-dashboard-test", [ids.location]]
      )
      return z
        .array(
          z.object({
            segment: z.string(),
            starts_at: timestampSchema,
            ends_at: timestampSchema,
          })
        )
        .parse(result.rows)
    }

    it("uses local overnight and split windows, including a split crossing midnight", async () => {
      await client.query(
        `update pg_temp.rota_published_shifts set day_date = '2026-10-15', start_time = '22:00', end_time = '02:00'`
      )
      expect((await windows())[0]).toMatchObject({
        starts_at: "2026-10-15T21:00:00.000Z",
        ends_at: "2026-10-16T01:00:00.000Z",
      })
      await client.query(
        `update pg_temp.rota_published_shifts set shift_type = 'split', end_time = '01:00', split_second_start_time = '02:00', split_second_end_time = '04:00'`
      )
      expect(await windows()).toEqual([
        {
          segment: "split_first",
          starts_at: "2026-10-15T21:00:00.000Z",
          ends_at: "2026-10-16T00:00:00.000Z",
        },
        {
          segment: "split_second",
          starts_at: "2026-10-16T01:00:00.000Z",
          ends_at: "2026-10-16T03:00:00.000Z",
        },
      ])
    })
    it("uses the configured closing time and next-day flag", async () => {
      await client.query(
        `insert into pg_temp.location_operating_hours values ($1, 5, '02:00', true)`,
        [ids.location]
      )
      await client.query(
        `update pg_temp.rota_published_shifts set shift_type = 'closing', start_time = '19:00', end_time = null, end_kind = 'location_close'`
      )
      expect((await windows())[0].ends_at).toBe("2026-10-17T01:00:00.000Z")
    })
    it("accounts for the extra hour across the autumn DST boundary", async () => {
      await client.query(
        `update pg_temp.rota_published_shifts set day_date = '2026-10-25', start_time = '00:00', end_time = '08:00'`
      )
      const row = (await windows())[0]
      expect(
        (Date.parse(row.ends_at) - Date.parse(row.starts_at)) / 3600000
      ).toBe(9)
    })
    it("matches the app's earlier instant for a repeated local clock time", async () => {
      await client.query(
        `update pg_temp.rota_published_shifts set day_date = '2026-10-25', start_time = '01:30', end_time = '08:00'`
      )
      expect((await windows())[0].starts_at).toBe("2026-10-25T00:30:00.000Z")
    })
    it("applies grace periods and keeps older arrivals until explicitly resolved", async () => {
      expect((await attention("2026-10-16T07:05:00Z")).total).toBe(0)
      expect((await attention("2026-10-16T07:05:01Z")).total).toBe(1)
      expect((await attention("2026-12-01T12:00:00Z")).total).toBe(1)
      await client.query(
        inTemporarySchema(`with ${dashboardScheduleSql}
       insert into public.dashboard_arrival_resolutions
         (location_id, employee_id, shift_key, assignment_id, shift_segment, scheduled_start_at, reason)
       select location_id, employee_id, shift_key, assignment_id, segment, starts_at, 'Confirmed cancelled shift.' from schedule_windows`),
        ["org-dashboard-test", [ids.location]]
      )
      expect((await attention("2026-12-01T12:00:00Z")).total).toBe(0)
      // Publishing replaces snapshot IDs, while the unchanged shift remains reviewed.
      await client.query(
        `update pg_temp.rota_published_shifts set id = '40000000-0000-4000-8000-000000000002'`
      )
      await client.query(
        `update pg_temp.rota_published_shift_assignments set id = '20000000-0000-4000-8000-000000000002', rota_published_shift_id = '40000000-0000-4000-8000-000000000002'`
      )
      await client.query(
        `update pg_temp.dashboard_arrival_resolutions set assignment_id = null`
      )
      expect((await attention("2026-12-01T12:00:00Z")).total).toBe(0)
    })
    it("does not flag an unmatched clock-in overlapping the shift as a missing arrival", async () => {
      await client.query(
        `insert into pg_temp.time_entries (id, organization_id, location_id, employee_id, clocked_in_at) values ($1, 'org-dashboard-test', $2, $3, '2026-10-16T07:00:00Z')`,
        [ids.assignment, ids.location, ids.employee]
      )
      expect((await attention("2026-10-16T10:00:00Z")).total).toBe(0)
    })
    it("prioritises old clock issues, counts all pages and clamps out-of-range pages", async () => {
      await client.query(
        `insert into pg_temp.time_entries (id, organization_id, location_id, employee_id, clocked_in_at, clocked_out_at, status) values ($1, 'org-dashboard-test', $2, $3, '2026-02-01T10:00Z', '2026-02-01T18:00Z', 'requires_review')`,
        [ids.assignment, ids.location, ids.employee]
      )
      const first = await attention(
        "2026-10-16T12:00:00Z",
        1,
        [ids.location],
        1
      )
      const last = await attention(
        "2026-10-16T12:00:00Z",
        999,
        [ids.location],
        1
      )
      expect(first).toMatchObject({ total: 2, items: [{ kind: "review" }] })
      expect(last).toMatchObject({ total: 2, items: [{ kind: "arrival" }] })
    })
    it("returns no attendance issues without the add-on or outside the organisation", async () => {
      expect((await attention("2026-10-16T12:00:00Z", 1, [])).total).toBe(0)
      expect(
        (await attention("2026-10-16T12:00:00Z", 1, [ids.otherLocation])).total
      ).toBe(0)
    })
  }
)
