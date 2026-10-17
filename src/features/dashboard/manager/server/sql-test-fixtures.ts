import type { PoolClient } from "pg"

const sqlFixtureIds = {
  location: "10000000-0000-4000-8000-000000000001",
  otherLocation: "10000000-0000-4000-8000-000000000002",
  employee: "30000000-0000-4000-8000-000000000001",
  shift: "40000000-0000-4000-8000-000000000001",
  assignment: "20000000-0000-4000-8000-000000000001",
  rota: "50000000-0000-4000-8000-000000000001",
}

// All integration writes are isolated in connection-local temporary tables.
// The application schema and live records are never changed by these tests.
function inTemporarySchema(sql: string): string {
  return sql.replaceAll("public.", "pg_temp.")
}

async function seedDashboardSqlFixtures(client: PoolClient): Promise<void> {
  await client.query(`
    create temp table "organization" (id text, shift_swaps_enabled boolean);
    create temp table locations (
      id uuid, organization_id text, name text, slug text, created_at timestamptz default now(),
      estimated_closing_time time default '23:00', estimated_closing_time_next_day boolean default false
    );
    create temp table employees (id uuid, full_name text, status text default 'active');
    create temp table location_clock_settings (
      location_id uuid, timezone text, is_enabled boolean default true,
      late_clock_in_grace_minutes int default 5, created_at timestamptz default '2026-01-01Z',
      forgotten_clock_out_alert_minutes int default 120, hard_review_after_minutes int default 720
    );
    create temp table location_operating_hours (location_id uuid, weekday int, close_time time, close_time_next_day boolean);
    create temp table rotas (id uuid, organization_id text, location_id uuid, status text, week_start date, has_unpublished_changes boolean default false);
    create temp table rota_published_shifts (
      id uuid, rota_id uuid, day_date date, shift_type text, start_time time, end_time time,
      end_kind text, split_second_start_time time, split_second_end_time time, zone_name_snapshot text
    );
    create temp table rota_published_shift_assignments (id uuid, rota_published_shift_id uuid, employee_id uuid);
    create temp table time_entries (
      id uuid, organization_id text, location_id uuid, employee_id uuid, rota_published_shift_id uuid,
      shift_segment text default 'full', clocked_in_at timestamptz, clocked_out_at timestamptz,
      scheduled_end_at timestamptz, status text default 'open', source text default 'employee_nfc', notes text
    );
    create temp table dashboard_arrival_resolutions (
      location_id uuid, employee_id uuid, shift_key text,
      assignment_id uuid, shift_segment text, scheduled_start_at timestamptz, reason text,
      unique (location_id, employee_id, shift_key, shift_segment, scheduled_start_at)
    );
    create temp table shift_swap_requests (
      id uuid, request_type text, status text, location_id uuid, requester_employee_id uuid,
      source_published_shift_id uuid, created_at timestamptz
    );
    insert into "organization" values ('org-dashboard-test', true), ('other-org', true);
  `)
  const ids = sqlFixtureIds
  await client.query(
    `insert into locations (id, organization_id, name, slug) values ($1, 'org-dashboard-test', 'Bar', 'bar'), ($2, 'other-org', 'Other', 'other')`,
    [ids.location, ids.otherLocation]
  )
  await client.query(
    `insert into employees (id, full_name) values ($1, 'Sam')`,
    [ids.employee]
  )
  await client.query(
    `insert into location_clock_settings (location_id, timezone) values ($1, 'Europe/London')`,
    [ids.location]
  )
  await client.query(
    `insert into rotas (id, organization_id, location_id, status, week_start) values ($1, 'org-dashboard-test', $2, 'published', '2026-10-12')`,
    [ids.rota, ids.location]
  )
  await client.query(
    `insert into rota_published_shifts (id, rota_id, day_date, shift_type, start_time, end_time, zone_name_snapshot) values ($1, $2, '2026-10-16', 'standard', '08:00', '16:00', 'Bar')`,
    [ids.shift, ids.rota]
  )
  await client.query(
    `insert into rota_published_shift_assignments values ($1, $2, $3)`,
    [ids.assignment, ids.shift, ids.employee]
  )
}

export { seedDashboardSqlFixtures, sqlFixtureIds, inTemporarySchema }
