import { randomUUID } from "node:crypto"
import * as pg from "pg"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

import { acquireBillingProcessingLock } from "./processing-locks"

const { connect } = vi.hoisted(() => ({ connect: vi.fn() }))
vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ connect }) }))

describe.skipIf(!process.env.DATABASE_URL)(
  "cross-worker billing claims in Postgres",
  () => {
    let pool: pg.Pool
    beforeAll(() => {
      pool = new pg.Pool({
        ...getDatabaseConnectionConfig(process.env.DATABASE_URL),
        max: 6,
      })
      connect.mockImplementation(() => pool.connect())
    })
    afterAll(async () => {
      await pool.end()
    })
    it.each(["event", "subscription"] as const)(
      "excludes another %s worker until the claim is released",
      async (scope) => {
        const id = `s12-${randomUUID()}`
        const claim = await acquireBillingProcessingLock(scope, id)
        expect(claim).not.toBeNull()
        const observer = await pool.connect()
        try {
          await observer.query("begin")
          const blocked = await observer.query(
            "select pg_try_advisory_xact_lock(hashtextextended($1,0)) as acquired",
            [`stripe:${scope}:${id}`]
          )
          expect(blocked.rows[0].acquired).toBe(false)
          await claim?.release()
          await claim?.release()
          const allowed = await observer.query(
            "select pg_try_advisory_xact_lock(hashtextextended($1,0)) as acquired",
            [`stripe:${scope}:${id}`]
          )
          expect(allowed.rows[0].acquired).toBe(true)
        } finally {
          await observer.query("rollback")
          observer.release()
          await claim?.release()
        }
      }
    )
  }
)
