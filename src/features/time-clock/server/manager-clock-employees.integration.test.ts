import { Pool } from "pg"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { listAssignedClockEmployees } from "./manager-clock-employees"
import { listManagedClockLocations } from "./managed-clock-locations"
// eslint-disable-next-line no-duplicate-imports
import type { PoolClient } from "pg"

vi.mock("@tanstack/react-start/server-only", () => ({}))
const database = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock("@/lib/db", () => ({ getDatabase: () => database }))

const locationA = "20000000-0000-4000-8000-000000000001"
const locationB = "20000000-0000-4000-8000-000000000002"
const outside = "20000000-0000-4000-8000-000000000003"

describe.skipIf(!process.env.DATABASE_URL)(
  "scoped clock employees against isolated Postgres tables",
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
      create temp table locations (id uuid, name text, slug text, organization_id text, created_at timestamptz default now());
      create temp table employees (id uuid primary key, full_name text, email text, status text);
      create temp table employee_location_assignments (employee_id uuid, location_id uuid, is_enabled boolean, disabled_at timestamptz);
      insert into pg_temp.employees values
        ('10000000-0000-4000-8000-000000000001', 'Alex', null, 'active'),
        ('10000000-0000-4000-8000-000000000002', 'Blair', 'blair@example.com', 'inactive');
    `)
      await connection.query(
        `insert into pg_temp.locations (id, name, slug, organization_id) values
        ($1, 'Main', 'main', 'org-a'), ($2, 'Second', 'second', 'org-a'), ($3, 'Outside', 'outside', 'org-b')`,
        [locationA, locationB, outside]
      )
      await connection.query(
        `insert into pg_temp.employee_location_assignments values
      ('10000000-0000-4000-8000-000000000001', $1, true, null),
      ('10000000-0000-4000-8000-000000000001', $2, true, null),
      ('10000000-0000-4000-8000-000000000001', $3, true, null),
      ('10000000-0000-4000-8000-000000000002', $1, true, null),
      ('10000000-0000-4000-8000-000000000002', $2, false, null),
      ('10000000-0000-4000-8000-000000000002', $2, true, now()),
      ('10000000-0000-4000-8000-000000000099', $1, true, null)
    `,
        [locationA, locationB, outside]
      )
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

    it("retains each enabled employee/location pair and inactive staff, excluding disabled, missing and out-of-scope rows", async () => {
      const rows = await listAssignedClockEmployees([locationA, locationB])
      expect(
        rows.map((row) => [row.full_name, row.location_id, row.status])
      ).toEqual([
        ["Alex", locationA, "active"],
        ["Alex", locationB, "active"],
        ["Blair", locationA, "inactive"],
      ])
      expect(rows[0].email).toBeNull()
    })

    it("does not issue a query for an empty permitted scope", async () => {
      database.query.mockClear()
      expect(await listAssignedClockEmployees([])).toEqual([])
      expect(database.query).not.toHaveBeenCalled()
    })

    it("reads only the authorized organization or single-location scope", async () => {
      const organizationLocations = await listManagedClockLocations({
        organizationId: "org-a",
        locationId: null,
      })
      expect(organizationLocations.map((row) => row.id)).toEqual([
        locationA,
        locationB,
      ])
      expect(
        await listManagedClockLocations({
          organizationId: null,
          locationId: locationA,
        })
      ).toEqual([{ id: locationA, name: "Main", organizationId: "org-a" }])
    })
  }
)
