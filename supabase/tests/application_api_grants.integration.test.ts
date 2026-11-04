import { readFile } from "node:fs/promises"
import * as pg from "pg"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { getDatabaseConnectionConfig } from "@rocketrota/db/connection-config"

describe.skipIf(!process.env.DATABASE_URL)(
  "server-only application API grants",
  () => {
    let pool: pg.Pool
    let client: pg.PoolClient
    beforeAll(async () => {
      pool = new pg.Pool(getDatabaseConnectionConfig(process.env.DATABASE_URL))
      client = await pool.connect()
      await client.query("begin")
      if (process.env.S15_PREVIEW_MIGRATION)
        await client.query(
          await readFile(process.env.S15_PREVIEW_MIGRATION, "utf8")
        )
    })
    afterAll(async () => {
      await client.query("rollback")
      client.release()
      await pool.end()
    })
    it("denies effective browser table, column and routine privileges while retaining server RPC access", async () => {
      const result =
        await client.query(`select count(*)::int as exposed from pg_class c join pg_namespace n on n.oid=c.relnamespace
      cross join (values ('anon'),('authenticated')) browser(role)
      where n.nspname in ('public','admin_private','billing_private','push_private','account_private','privacy_private')
        and c.relkind in ('r','p','v','m','f')
        and not exists(select 1 from pg_depend d where d.classid='pg_class'::regclass and d.objid=c.oid and d.deptype='e')
        and (has_table_privilege(browser.role, c.oid, 'SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER')
          or has_any_column_privilege(browser.role, c.oid, 'SELECT, INSERT, UPDATE, REFERENCES'))`)
      expect(result.rows[0].exposed).toBe(0)
      const functions =
        await client.query(`select count(*)::int as exposed from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      cross join (values ('anon'),('authenticated')) browser(role)
      where n.nspname = 'public' and p.prosecdef and has_function_privilege(browser.role,p.oid,'EXECUTE')
        and not exists(select 1 from pg_depend d where d.classid='pg_proc'::regclass and d.objid=p.oid and d.deptype='e')`)
      expect(functions.rows[0].exposed).toBe(0)
      const privateTables =
        await client.query(`select count(*)::int as unprotected from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname in ('admin_private','billing_private','push_private','account_private','privacy_private') and c.relkind in ('r','p') and not c.relrowsecurity`)
      expect(privateTables.rows[0].unprotected).toBe(0)
      const rpc = await client.query(
        "select has_function_privilege('service_role','public.claim_clock_scan_session(text,text,integer,text,text)','execute') as allowed"
      )
      expect(rpc.rows[0].allowed).toBe(true)
    })
    it("keeps new postgres-owned objects private by default", async () => {
      await client.query(
        "create table public.s15_default_grant_fixture (id integer)"
      )
      await client.query(
        "create function public.s15_default_function_fixture() returns boolean language sql as 'select true'"
      )
      const result =
        await client.query(`select has_table_privilege('anon','public.s15_default_grant_fixture','SELECT') as anon_table,
      has_table_privilege('authenticated','public.s15_default_grant_fixture','SELECT') as user_table,
      has_function_privilege('anon','public.s15_default_function_fixture()','EXECUTE') as anon_function,
      has_function_privilege('authenticated','public.s15_default_function_fixture()','EXECUTE') as user_function`)
      expect(result.rows[0]).toEqual({
        anon_table: false,
        user_table: false,
        anon_function: false,
        user_function: false,
      })
    })
    it("retains real server-role station provisioning, scan, clock-in and clock-out with synthetic workforce fixtures", async () => {
      await client.query(
        await readFile("supabase/tests/clock_tag_access.sql", "utf8")
      )
    })
  }
)
