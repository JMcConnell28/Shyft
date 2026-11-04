import { randomUUID } from "node:crypto"
import * as pg from "pg"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

import { getBillingReconciliationHealth } from "./billing-reconciliation"

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("./index", () => ({ getDatabase: () => ({ query }) }))

describe.skipIf(!process.env.DATABASE_URL)(
  "shared reconciliation health in Postgres",
  () => {
    let pool: pg.Pool
    let client: pg.PoolClient
    beforeAll(async () => {
      pool = new pg.Pool(getDatabaseConnectionConfig(process.env.DATABASE_URL))
      client = await pool.connect()
      await client.query("begin")
      const id = `s14-${randomUUID()}`
      await client.query(
        "insert into public.organization (id, name, slug, \"createdAt\") values ($1, 'S14 fixture', $1, now())",
        [id]
      )
      await client.query(
        "insert into public.billing_accounts (scope, organization_id, stripe_customer_id) values ('organization', $1, $2)",
        [id, `cus_${id}`]
      )
      query.mockImplementation((sql: string) => client.query(sql))
    })
    beforeEach(async () => {
      await client.query("savepoint health_case")
    })
    afterEach(async () => {
      await client.query("rollback to savepoint health_case")
    })
    afterAll(async () => {
      await client.query("rollback")
      client.release()
      await pool.end()
    })
    it("reports a successful most recent run without exposing account records", async () => {
      await client.query(
        "insert into public.billing_reconciliation_runs (status, started_at, finished_at) values ('completed', '2099-01-01', '2099-01-01')"
      )
      expect(await getBillingReconciliationHealth()).toMatchObject({
        hasCustomers: true,
        lastStatus: "completed",
        needsAttention: false,
      })
    })
    it("flags the latest failed run even when a successful run exists", async () => {
      await client.query(
        "insert into public.billing_reconciliation_runs (status, started_at, finished_at) values ('completed', '2099-01-01', '2099-01-01'), ('failed', '2099-01-02', '2099-01-02')"
      )
      expect(await getBillingReconciliationHealth()).toMatchObject({
        hasCustomers: true,
        lastStatus: "failed",
        needsAttention: true,
      })
    })
  }
)
