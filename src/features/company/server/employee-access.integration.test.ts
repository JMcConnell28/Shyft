import * as pg from "pg"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { assertEmployeesInScope, getEmployeeAccount } from "./employee-access"
import type { CompanyScope } from "./shared"

const { database } = vi.hoisted(() => ({ database: { query: vi.fn() } }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => database }))

const ids = {
  located: "00000000-0000-4000-8000-000000000001",
  unlocated: "00000000-0000-4000-8000-000000000002",
  otherOrganization: "00000000-0000-4000-8000-000000000003",
  standalone: "00000000-0000-4000-8000-000000000004",
  otherStandalone: "00000000-0000-4000-8000-000000000005",
  locationA: "00000000-0000-4000-8000-000000000010",
  locationB: "00000000-0000-4000-8000-000000000011",
}
const organizationScope: CompanyScope = {
  organizationId: "business-a",
  locationId: null,
  userId: "admin",
}
const standaloneScope: CompanyScope = {
  organizationId: null,
  locationId: ids.locationA,
  userId: "admin",
}

describe.skipIf(!process.env.DATABASE_URL)(
  "company employee scope in Postgres",
  () => {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      connectionTimeoutMillis: 15000,
    })
    let client: pg.PoolClient | undefined

    beforeAll(async () => {
      client = await pool.connect()
      const fixtureClient = client
      await client.query("begin")
      await client.query(`create temporary table employee_scope_fixture (
      id uuid primary key, organization_id text, location_id uuid,
      full_name text default 'Scope fixture', email text, user_id text, offboarded_at timestamptz
    ) on commit drop`)
      await client.query(
        `insert into employee_scope_fixture(id, organization_id, location_id) values
      ($1, 'business-a', $6), ($2, 'business-a', null), ($3, 'business-b', $6),
      ($4, null, $6), ($5, null, $7)`,
        [
          ids.located,
          ids.unlocated,
          ids.otherOrganization,
          ids.standalone,
          ids.otherStandalone,
          ids.locationA,
          ids.locationB,
        ]
      )
      database.query.mockImplementation((sql: string, values: Array<unknown>) =>
        fixtureClient.query(
          sql.replaceAll("public.employees", "pg_temp.employee_scope_fixture"),
          values
        )
      )
    })
    afterAll(async () => {
      if (client) {
        await client.query("rollback")
        client.release()
      }
      await pool.end()
    })

    it("finds an organization employee already based at a location", async () => {
      expect(
        (await getEmployeeAccount(organizationScope, ids.located)).id
      ).toBe(ids.located)
    })
    it("continues to find organization employees without a primary location", async () => {
      expect(
        (await getEmployeeAccount(organizationScope, ids.unlocated)).id
      ).toBe(ids.unlocated)
    })
    it("rejects employees of another organization", async () => {
      await expect(
        getEmployeeAccount(organizationScope, ids.otherOrganization)
      ).rejects.toThrow("could not be found")
      await expect(
        getEmployeeAccount(organizationScope, ids.standalone)
      ).rejects.toThrow("could not be found")
    })
    it("keeps standalone employee access limited to the selected location", async () => {
      expect(
        (await getEmployeeAccount(standaloneScope, ids.standalone)).id
      ).toBe(ids.standalone)
      await expect(
        getEmployeeAccount(standaloneScope, ids.otherStandalone)
      ).rejects.toThrow("could not be found")
      await expect(
        getEmployeeAccount(standaloneScope, ids.located)
      ).rejects.toThrow("could not be found")
    })
    it("accepts a mixed-location organization selection for bulk updates", async () => {
      await expect(
        assertEmployeesInScope(organizationScope, [ids.located, ids.unlocated])
      ).resolves.toBeUndefined()
    })
    it("rejects a bulk selection containing another business's employee", async () => {
      await expect(
        assertEmployeesInScope(organizationScope, [
          ids.located,
          ids.otherOrganization,
        ])
      ).rejects.toThrow("could not be found")
    })
  }
)
