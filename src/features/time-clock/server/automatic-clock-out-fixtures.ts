import { readFile } from "node:fs/promises"
import type { PoolClient } from "pg"

const automationIds = {
  employee: "10000000-0000-4000-8000-000000000001",
  location: "20000000-0000-4000-8000-000000000001",
}

function temporaryClockSql(sql: string): string {
  return sql.replaceAll("public.", "pg_temp.")
}

async function seedClockAutomationFixtures(client: PoolClient): Promise<void> {
  await client.query(`
    create temp table time_entries (
      id uuid primary key default gen_random_uuid(), employee_id uuid, location_id uuid,
      organization_id text default 'org', user_id text default 'manager-user',
      clocked_in_at timestamptz not null, clocked_out_at timestamptz,
      scheduled_end_at timestamptz, payable_start_at timestamptz, payable_end_at timestamptz,
      updated_at timestamptz, updated_by text, status text default 'open',
      source text default 'employee_nfc', notes text default 'Original note'
    );
    create temp table clock_events (
      id uuid default gen_random_uuid(), time_entry_id uuid, employee_id uuid,
      location_id uuid, organization_id text, event_type text, event_at timestamptz,
      reason text, metadata jsonb,
      constraint clock_events_event_type_check check(event_type in ('clock_in', 'clock_out'))
    );
    create temp table location_clock_settings (location_id uuid primary key, forgotten_clock_out_alert_minutes int, hard_review_after_minutes int);
    create temp table employees (id uuid, user_id text);
    create temp table locations (id uuid, organization_id text, slug text);
    create temp table "organization" (id text, slug text);
  `)
  const migration = await readFile(
    "supabase/migrations/20261018124937_automatic_clock_out.sql",
    "utf8"
  )
  await client.query(temporaryClockSql(migration))
  const settingsMigration = await readFile(
    "supabase/migrations/20261018131628_configurable_clock_out_times.sql",
    "utf8"
  )
  await client.query(temporaryClockSql(settingsMigration))
  await client.query(
    `insert into pg_temp.employees values ($1, 'employee-user');
    `,
    [automationIds.employee]
  )
  await client.query(
    `insert into pg_temp.locations values ($1, 'org', 'location')`,
    [automationIds.location]
  )
  await client.query(
    `insert into pg_temp."organization" values ('org', 'team')`
  )
}

async function addClockAutomationEntry(
  client: PoolClient,
  clockedInAt: string,
  scheduledEndAt: string | null
): Promise<string> {
  const result = await client.query<{ id: string }>(
    `insert into pg_temp.time_entries (employee_id, location_id, clocked_in_at, payable_start_at, scheduled_end_at)
     values ($1, $2, $3::timestamptz, $3::timestamptz, $4::timestamptz) returning id`,
    [
      automationIds.employee,
      automationIds.location,
      clockedInAt,
      scheduledEndAt,
    ]
  )
  return result.rows[0].id
}

export {
  automationIds,
  temporaryClockSql,
  seedClockAutomationFixtures,
  addClockAutomationEntry,
}
