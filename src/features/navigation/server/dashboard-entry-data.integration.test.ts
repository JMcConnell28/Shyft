import { Pool } from "pg"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
// eslint-disable-next-line no-duplicate-imports
import type { PoolClient } from "pg"
import { findLatestPendingJoinRequestId } from "@/features/join-approvals/server/pending-request-id"
import { organizationHasLocation } from "@/features/onboarding/server/organization-location-exists"

vi.mock("@tanstack/react-start/server-only", () => ({}))
const database = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock("@/lib/db", () => ({ getDatabase: () => database }))

describe.skipIf(!process.env.DATABASE_URL)(
  "dashboard entry reads against isolated Postgres tables",
  () => {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 15_000,
    })
    let client: PoolClient | undefined
    beforeAll(async () => {
      const connection = await pool.connect()
      client = connection
      await connection.query("begin")
      await connection.query(`
      create temp table locations (organization_id text);
      insert into pg_temp.locations values ('org-with-location');
      create temp table staff_join_requests (id uuid, user_id text, status text, created_at timestamptz);
      insert into pg_temp.staff_join_requests values
        ('10000000-0000-4000-8000-000000000001', 'alex', 'pending', '2026-01-01'),
        ('10000000-0000-4000-8000-000000000002', 'alex', 'pending', '2026-02-01'),
        ('10000000-0000-4000-8000-000000000003', 'alex', 'approved', '2026-03-01'),
        ('10000000-0000-4000-8000-000000000004', 'blair', 'pending', '2026-04-01');
    `)
      database.query.mockImplementation((sql: string, values: Array<unknown>) =>
        connection.query(sql.replaceAll("public.", "pg_temp."), values)
      )
    })
    afterAll(async () => {
      if (client) {
        await client.query("rollback")
        client.release()
      }
      await pool.end()
    })

    it("checks location existence only within the selected organization", async () => {
      expect(await organizationHasLocation("org-with-location")).toBe(true)
      expect(await organizationHasLocation("org-without-location")).toBe(false)
    })

    it("selects only the latest pending request belonging to the session user", async () => {
      expect(await findLatestPendingJoinRequestId("alex")).toBe(
        "10000000-0000-4000-8000-000000000002"
      )
      expect(await findLatestPendingJoinRequestId("no-requests")).toBeNull()
    })
  }
)
