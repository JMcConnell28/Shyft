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
import { upsertPushSubscription } from "./save-subscription"

const { connect } = vi.hoisted(() => ({ connect: vi.fn() }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ connect }) }))

describe.skipIf(!process.env.DATABASE_URL)(
  "push registration limits in Postgres",
  () => {
    let pool: pg.Pool
    let client: pg.PoolClient
    let userId: string
    let endpoint: string
    const keys = {
      auth: "fixture-auth-key",
      p256dh: "fixture-public-key-for-database-only",
    }

    beforeAll(async () => {
      pool = new pg.Pool({
        ...getDatabaseConnectionConfig(process.env.DATABASE_URL),
        max: 2,
        connectionTimeoutMillis: 10000,
      })
      client = await pool.connect()
      // Keep production SQL and locks real while trapping its commits inside the
      // fixture transaction. No synthetic user or subscription is ever committed.
      connect.mockResolvedValue({
        query: (sql: string, values?: Array<unknown>) => {
          if (sql.startsWith("begin"))
            return client.query("savepoint subscription_save")
          if (sql === "commit")
            return client.query("release savepoint subscription_save")
          if (sql === "rollback")
            return client.query("rollback to savepoint subscription_save")
          return client.query(sql, values)
        },
        release: () => undefined,
      })
    })
    beforeEach(async () => {
      userId = `s04-${randomUUID()}`
      endpoint = `https://fcm.googleapis.com/fcm/send/${userId}-`
      await client.query("begin isolation level read committed")
      await client.query(
        `insert into public."user" (id, name, email, "emailVerified") values ($1, 'S04 fixture', $2, false)`,
        [userId, `${userId}@example.invalid`]
      )
    })
    afterEach(async () => {
      await client.query("rollback")
    })
    afterAll(async () => {
      client.release()
      await pool.end()
    })

    const save = (suffix: string) =>
      upsertPushSubscription({
        userId,
        subscription: { endpoint: endpoint + suffix, keys },
      })

    it("caps new registrations, permits refresh at the cap, and frees revoked slots", async () => {
      await client.query(
        `insert into push_private.push_subscriptions (user_id, endpoint, p256dh_key, auth_key)
       select $1, $2 || item, $3, $4 from generate_series(1, 10) item`,
        [userId, endpoint, keys.p256dh, keys.auth]
      )
      await expect(save("11")).rejects.toThrow("device limit")
      await expect(save("1")).resolves.toBeUndefined()
      await client.query(
        "update push_private.push_subscriptions set revoked_at = now() where user_id = $1 and endpoint = $2",
        [userId, endpoint + "2"]
      )
      await expect(save("11")).resolves.toBeUndefined()
      const result = await client.query(
        "select count(*)::integer as total from push_private.push_subscriptions where user_id = $1 and revoked_at is null",
        [userId]
      )
      expect(result.rows[0].total).toBe(10)
    })

    it("does not let an account replace another account's endpoint", async () => {
      const otherUser = `${userId}-other`
      await client.query(
        `insert into public."user" (id, name, email, "emailVerified") values ($1, 'S04 fixture', $2, false)`,
        [otherUser, `${otherUser}@example.invalid`]
      )
      await client.query(
        "insert into push_private.push_subscriptions (user_id, endpoint, p256dh_key, auth_key) values ($1, $2, $3, $4)",
        [otherUser, endpoint + "owned", keys.p256dh, keys.auth]
      )
      await expect(save("owned")).rejects.toThrow("another account")
      const result = await client.query(
        "select user_id from push_private.push_subscriptions where endpoint = $1",
        [endpoint + "owned"]
      )
      expect(result.rows[0].user_id).toBe(otherUser)
    })

    it("takes a database transaction lock that also blocks a second app connection", async () => {
      await save("locked")
      const observer = await pool.connect()
      try {
        const result = await observer.query(
          "select pg_try_advisory_xact_lock(hashtextextended('push-subscriptions:' || $1, 0)) as acquired",
          [userId]
        )
        expect(result.rows[0].acquired).toBe(false)
      } finally {
        observer.release()
      }
    })
  }
)
