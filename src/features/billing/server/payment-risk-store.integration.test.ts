import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"
import * as pg from "pg"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

describe.skipIf(!process.env.DATABASE_URL)(
  "private payment risk review store",
  () => {
    let pool: pg.Pool
    let client: pg.PoolClient
    beforeAll(async () => {
      pool = new pg.Pool(getDatabaseConnectionConfig(process.env.DATABASE_URL))
      client = await pool.connect()
      await client.query("begin")
      if (process.env.S12_PREVIEW_MIGRATION)
        await client.query(
          await readFile(process.env.S12_PREVIEW_MIGRATION, "utf8")
        )
    })
    afterAll(async () => {
      await client.query("rollback")
      client.release()
      await pool.end()
    })
    it("deduplicates linked and unmatched events and keeps all browser privileges denied", async () => {
      const id = `evt_s12_${randomUUID()}`
      const insert = (subscription: string | null) =>
        client.query(
          `insert into billing_private.payment_risk_reviews
      (stripe_event_id, risk_type, stripe_subscription_id, stripe_charge_id, amount, amount_refunded, currency, livemode, event_created_at)
      values ($1, 'refund', $2, 'ch_synthetic_fixture', 1000, 100, 'gbp', false, now())
      on conflict (stripe_event_id, stripe_subscription_id) do nothing`,
          [id, subscription]
        )
      await insert(null)
      await insert(null)
      await insert("sub_synthetic_fixture")
      await insert("sub_synthetic_fixture")
      const result = await client.query(
        "select count(*)::int as count from billing_private.payment_risk_reviews where stripe_event_id = $1",
        [id]
      )
      expect(result.rows[0].count).toBe(2)
      const privileges = await client.query(`select relrowsecurity as rls,
      has_table_privilege('anon', oid, 'SELECT, INSERT, UPDATE, DELETE') as anon,
      has_table_privilege('authenticated', oid, 'SELECT, INSERT, UPDATE, DELETE') as authenticated
      from pg_class where oid = 'billing_private.payment_risk_reviews'::regclass`)
      expect(privileges.rows[0]).toEqual({
        rls: true,
        anon: false,
        authenticated: false,
      })
    })
  }
)
