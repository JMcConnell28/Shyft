import { readFile } from "node:fs/promises"
import type { PoolClient } from "pg"

const locationA = "00000000-0000-4000-8000-000000000001"
const locationB = "00000000-0000-4000-8000-000000000002"
const foreignLocation = "00000000-0000-4000-8000-000000000003"
const groupId = "00000000-0000-4000-8000-000000000004"

async function createJoinLocationFixtures(client: PoolClient): Promise<void> {
  await client.query(`
    create temp table locations (id uuid primary key, organization_id text, name text, created_at timestamptz default now());
    create temp table staff_groups (id uuid primary key, organization_id text, name text);
    create temp table "user" (id text primary key, name text, email text, "dateOfBirth" date);
    create temp table "member" (id text primary key, "organizationId" text, "userId" text, role text, "createdAt" timestamptz);
    create temp table employees (id uuid primary key default gen_random_uuid(), organization_id text,
      user_id text, staff_group_id uuid, full_name text, email text, status text, updated_at timestamptz);
    create unique index on employees (organization_id, user_id) where user_id is not null;
    create temp table employee_compensation (employee_id uuid primary key, organization_id text,
      location_id uuid, pay_type text, hourly_rate_pence integer);
    create temp table employee_location_assignments (organization_id text, employee_id uuid, location_id uuid,
      staff_group_id uuid, is_enabled boolean, disabled_at timestamptz, unique(employee_id, location_id));
    create temp table staff_invite_links (id uuid primary key default gen_random_uuid(), organization_id text,
      location_id uuid not null, default_staff_group_id uuid, token text, expires_at timestamptz,
      disabled_at timestamptz, created_by text, created_at timestamptz default now());
    create temp table staff_join_requests (id uuid primary key default gen_random_uuid(), organization_id text,
      location_id uuid, staff_group_id uuid, invite_link_id uuid, user_id text, status text default 'pending',
      created_at timestamptz default now(), decided_at timestamptz, decided_by text, unique(user_id, invite_link_id));
  `)
  await client.query(
    `insert into locations values ($1, 'org', 'Main', now()), ($2, 'org', 'Second', now()), ($3, 'other', 'Foreign', now());`,
    [locationA, locationB, foreignLocation]
  )
  await client.query(
    `insert into staff_groups values ($1, 'org', 'Employee')`,
    [groupId]
  )
  await client.query(
    `insert into staff_invite_links (organization_id, location_id, default_staff_group_id, token) values ('org', $1, $2, 'legacy')`,
    [locationA, groupId]
  )
  const migration = await readFile(
    new URL(
      "../../../../supabase/migrations/20261106205247_organization_join_locations.sql",
      import.meta.url
    ),
    "utf8"
  )
  await client.query(migration.replaceAll("public.", "pg_temp."))
}

// Production functions keep their SQL unchanged; all tables resolve to this connection's temporary fixtures.
function fixtureClient(client: PoolClient): PoolClient {
  return new Proxy(client, {
    get(target, property) {
      if (property === "query")
        return (sql: string, values?: Array<unknown>) =>
          target.query(sql.replaceAll("public.", "pg_temp."), values)
      if (property === "release") return () => {}
      return Reflect.get(target, property)
    },
  })
}

export {
  createJoinLocationFixtures,
  fixtureClient,
  locationA,
  locationB,
  foreignLocation,
  groupId,
}
