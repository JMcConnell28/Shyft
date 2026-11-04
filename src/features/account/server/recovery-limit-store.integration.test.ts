import { randomBytes } from "node:crypto"
import { readFile } from "node:fs/promises"
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

import { consumeRecoveryLimit } from "./recovery-limit-store"

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))

function createPool(max: number) {
  return new pg.Pool({
    ...getDatabaseConnectionConfig(process.env.DATABASE_URL),
    max,
    connectionTimeoutMillis: 10000,
  })
}

const previewMigration = process.env.S08_PREVIEW_MIGRATION

describe.skipIf(!process.env.DATABASE_URL)(
  "private recovery store in Postgres",
  () => {
    let pool: pg.Pool
    let client: pg.PoolClient
    let key: string

    beforeAll(async () => {
      pool = createPool(1)
      client = await pool.connect()
      if (previewMigration) {
        await client.query("begin")
        await client.query(await readFile(previewMigration, "utf8"))
      }
      query.mockImplementation((sql: string, values?: Array<unknown>) =>
        client.query(sql, values)
      )
    })
    beforeEach(async () => {
      key = randomBytes(32).toString("hex")
      await client.query(
        previewMigration ? "savepoint recovery_fixture" : "begin"
      )
    })
    afterEach(async () => {
      await client.query(
        previewMigration ? "rollback to savepoint recovery_fixture" : "rollback"
      )
    })
    afterAll(async () => {
      if (previewMigration) await client.query("rollback")
      client.release()
      await pool.end()
    })

    it("enforces the budget and does not extend the window on denials", async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        expect(await consumeRecoveryLimit(key, 3, 900)).toMatchObject({
          allowed: true,
        })
      }
      const before = await client.query(
        "select expires_at from account_private.password_recovery_limits where key_hash = $1",
        [key]
      )
      for (let attempt = 0; attempt < 5; attempt++) {
        expect(await consumeRecoveryLimit(key, 3, 900)).toMatchObject({
          allowed: false,
        })
      }
      const after = await client.query(
        "select hit_count, expires_at from account_private.password_recovery_limits where key_hash = $1",
        [key]
      )
      expect(after.rows[0].hit_count).toBe(4)
      expect(after.rows[0].expires_at).toEqual(before.rows[0].expires_at)
    })

    it("permits recovery again after expiry using the database clock", async () => {
      await consumeRecoveryLimit(key, 1, 900)
      expect(await consumeRecoveryLimit(key, 1, 900)).toMatchObject({
        allowed: false,
      })
      await client.query(
        "update account_private.password_recovery_limits set expires_at = statement_timestamp() - interval '1 second' where key_hash = $1",
        [key]
      )
      expect(await consumeRecoveryLimit(key, 1, 900)).toMatchObject({
        allowed: true,
      })
    })

    it("denies all browser table privileges and enables RLS", async () => {
      const result = await client.query(`select
      c.relrowsecurity as rls,
      has_table_privilege('anon', c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER') as anon_access,
      has_table_privilege('authenticated', c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER') as user_access
      from pg_class c where c.oid = 'account_private.password_recovery_limits'::regclass`)
      expect(result.rows[0]).toEqual({
        rls: true,
        anon_access: false,
        user_access: false,
      })
    })
  }
)

describe.skipIf(!process.env.DATABASE_URL || Boolean(previewMigration))(
  "recovery limits across concurrent connections",
  () => {
    let pool: pg.Pool
    const key = randomBytes(32).toString("hex")
    beforeAll(() => {
      pool = createPool(6)
      query.mockImplementation((sql: string, values?: Array<unknown>) =>
        pool.query(sql, values)
      )
    })
    afterAll(async () => {
      // Only this test's random synthetic bucket is committed, then removed.
      await pool.query(
        "delete from account_private.password_recovery_limits where key_hash = $1",
        [key]
      )
      await pool.end()
    })
    it("allows exactly three of thirty simultaneous attempts across six connections", async () => {
      const attempts = await Promise.all(
        Array.from({ length: 30 }, () => consumeRecoveryLimit(key, 3, 900))
      )
      expect(attempts.filter((result) => result.allowed)).toHaveLength(3)
      expect(attempts.filter((result) => !result.allowed)).toHaveLength(27)
    }, 30_000)
  }
)
