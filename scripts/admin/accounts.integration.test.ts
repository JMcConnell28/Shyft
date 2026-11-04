import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"
import * as pg from "pg"
import { verifyPassword } from "better-auth/crypto"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

import { provisionAdminAccount, resetAdminMfa } from "./accounts.mjs"

describe.skipIf(!process.env.DATABASE_URL)(
  "offline admin provisioning in Postgres",
  () => {
    let pool: pg.Pool
    let client: pg.PoolClient
    let fixture: pg.PoolClient
    const password = "synthetic-operator-password-only"
    let email: string
    beforeAll(async () => {
      pool = new pg.Pool({
        ...getDatabaseConnectionConfig(process.env.DATABASE_URL),
        max: 1,
      })
      client = await pool.connect()
      await client.query("begin")
      if (process.env.S05_PREVIEW_MIGRATION)
        await client.query(
          await readFile(process.env.S05_PREVIEW_MIGRATION, "utf8")
        )
      fixture = new Proxy(client, {
        get(target, property) {
          if (property === "query")
            return (sql: string, values?: Array<unknown>) => {
              if (sql === "begin")
                return client.query("savepoint operator_action")
              if (sql === "commit")
                return client.query("release savepoint operator_action")
              if (sql === "rollback")
                return client.query("rollback to savepoint operator_action")
              return client.query(sql, values)
            }
          return Reflect.get(target, property)
        },
      })
    })
    beforeEach(async () => {
      email = `s05-${randomUUID()}@example.invalid`
      await client.query("savepoint test_case")
    })
    afterEach(async () => {
      await client.query("rollback to savepoint test_case")
    })
    afterAll(async () => {
      await client.query("rollback")
      client.release()
      await pool.end()
    })
    const input = () => ({
      email,
      name: "S05 fixture",
      role: "readonly" as const,
      operator: "Security test fixture",
    })

    it("creates an audited credential with a password hash and no pre-enabled second factor", async () => {
      const id = await provisionAdminAccount(fixture, input(), password)
      const result = await client.query(
        `select u.role, u."twoFactorEnabled", a.password from admin_private.admin_user u join admin_private.admin_account a on a."userId" = u.id where u.id = $1`,
        [id]
      )
      expect(result.rows[0]).toMatchObject({
        role: "readonly",
        twoFactorEnabled: false,
      })
      expect(result.rows[0].password).not.toBe(password)
      expect(
        await verifyPassword({ hash: result.rows[0].password, password })
      ).toBe(true)
      const logs = await client.query(
        "select metadata from admin_private.admin_audit_logs where target_id = $1",
        [id]
      )
      expect(logs.rows[0].metadata).toMatchObject({
        source: "operator-cli",
        operator: input().operator,
      })
      expect(JSON.stringify(logs.rows)).not.toContain(password)
    })
    it("resets MFA and revokes all sessions and challenges without re-enabling disabled operators", async () => {
      const id = await provisionAdminAccount(fixture, input(), password)
      await client.query(
        'update admin_private.admin_user set "twoFactorEnabled" = true where id = $1',
        [id]
      )
      await client.query(
        "insert into admin_private.admin_two_factor (id, \"userId\", secret, \"backupCodes\", verified) values ($1, $1, 'fixture-secret', 'fixture-codes', true)",
        [id]
      )
      await client.query(
        'insert into admin_private.admin_session (id, token, "userId", "expiresAt", "updatedAt") values ($1, $1, $1, now() + interval \'1 hour\', now())',
        [id]
      )
      await client.query(
        "insert into admin_private.admin_verification (id, identifier, value, \"expiresAt\") values ($1, $1, $1, now() + interval '1 hour')",
        [id]
      )
      await resetAdminMfa(fixture, input())
      const result = await client.query(
        `select "twoFactorEnabled" as enabled,
      (select count(*)::int from admin_private.admin_session where "userId" = $1) as sessions,
      (select count(*)::int from admin_private.admin_two_factor where "userId" = $1) as factors,
      (select count(*)::int from admin_private.admin_verification where value = $1) as challenges
      from admin_private.admin_user where id = $1`,
        [id]
      )
      expect(result.rows[0]).toEqual({
        enabled: false,
        sessions: 0,
        factors: 0,
        challenges: 0,
      })
      await client.query(
        "update admin_private.admin_user set disabled_at = now() where id = $1",
        [id]
      )
      await expect(resetAdminMfa(fixture, input())).rejects.toThrow(
        "active provisioned"
      )
    })
  }
)
