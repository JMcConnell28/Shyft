import "@tanstack/react-start/server-only"

import { addDays, format, parseISO, startOfWeek } from "date-fns"
import { hashPassword } from "better-auth/crypto"
import type { PoolClient } from "pg"

import {
  DEMO_ACCOUNT_EMAIL,
  DEMO_ACCOUNT_NAME,
  DEMO_ACCOUNT_PASSWORD,
  DEMO_LOCATION_NAME,
  DEMO_LOCATION_SLUG,
} from "@/features/demo/constants"
import { getDatabase } from "@/lib/db"

type IdRow = {
  id: string
}

type LocationRow = IdRow & {
  billing_account_id: string
}

type DemoEmployeeSeed = {
  email: string
  fullName: string
  groupSlug:
    | "bar"
    | "cleaning"
    | "floor"
    | "hosts"
    | "kitchen"
    | "management"
    | "security"
  status?: "active" | "inactive"
}

type DemoShiftSeed = {
  assignmentEmail: string
  dayOffset: number
  endTime: string
  startTime: string
  zoneName: string
}

const demoUserId = "demo-user-rocketrota"
const demoCredentialAccountId = "demo-user-rocketrota-credential"

const demoGroups = [
  { name: "Management", slug: "management", color: "violet" },
  { name: "Bar Team", slug: "bar", color: "sky" },
  { name: "Floor Team", slug: "floor", color: "emerald" },
  { name: "Kitchen Team", slug: "kitchen", color: "rose" },
  { name: "Hosts", slug: "hosts", color: "amber" },
  { name: "Security", slug: "security", color: "slate" },
  { name: "Cleaning", slug: "cleaning", color: "cyan" },
] as const

const demoZones = [
  "Main Bar",
  "Cocktail Bar",
  "Floor",
  "Kitchen",
  "Entrance",
] as const

const demoEmployees: DemoEmployeeSeed[] = [
  {
    email: DEMO_ACCOUNT_EMAIL,
    fullName: DEMO_ACCOUNT_NAME,
    groupSlug: "management",
  },
  {
    email: "sam.taylor@demo.rocketrota.test",
    fullName: "Sam Taylor",
    groupSlug: "bar",
  },
  {
    email: "mia.clarke@demo.rocketrota.test",
    fullName: "Mia Clarke",
    groupSlug: "floor",
  },
  {
    email: "james.patel@demo.rocketrota.test",
    fullName: "James Patel",
    groupSlug: "kitchen",
  },
  {
    email: "amelia.hughes@demo.rocketrota.test",
    fullName: "Amelia Hughes",
    groupSlug: "floor",
  },
  {
    email: "leo.morgan@demo.rocketrota.test",
    fullName: "Leo Morgan",
    groupSlug: "bar",
  },
  {
    email: "sofia.ross@demo.rocketrota.test",
    fullName: "Sofia Ross",
    groupSlug: "hosts",
  },
  {
    email: "noah.wilson@demo.rocketrota.test",
    fullName: "Noah Wilson",
    groupSlug: "security",
  },
  {
    email: "eva.brooks@demo.rocketrota.test",
    fullName: "Eva Brooks",
    groupSlug: "cleaning",
  },
  {
    email: "harry.green@demo.rocketrota.test",
    fullName: "Harry Green",
    groupSlug: "bar",
  },
  {
    email: "isla.scott@demo.rocketrota.test",
    fullName: "Isla Scott",
    groupSlug: "floor",
  },
  {
    email: "oscar.king@demo.rocketrota.test",
    fullName: "Oscar King",
    groupSlug: "kitchen",
  },
  {
    email: "freya.hall@demo.rocketrota.test",
    fullName: "Freya Hall",
    groupSlug: "hosts",
  },
  {
    email: "archie.young@demo.rocketrota.test",
    fullName: "Archie Young",
    groupSlug: "security",
  },
  {
    email: "riley.evans@demo.rocketrota.test",
    fullName: "Riley Evans",
    groupSlug: "kitchen",
    status: "inactive",
  },
]

const demoShifts: DemoShiftSeed[] = [
  {
    assignmentEmail: DEMO_ACCOUNT_EMAIL,
    dayOffset: 0,
    startTime: "09:00",
    endTime: "17:00",
    zoneName: "Main Bar",
  },
  {
    assignmentEmail: "sam.taylor@demo.rocketrota.test",
    dayOffset: 1,
    startTime: "12:00",
    endTime: "20:00",
    zoneName: "Main Bar",
  },
  {
    assignmentEmail: "sofia.ross@demo.rocketrota.test",
    dayOffset: 1,
    startTime: "17:00",
    endTime: "22:00",
    zoneName: "Entrance",
  },
  {
    assignmentEmail: "mia.clarke@demo.rocketrota.test",
    dayOffset: 2,
    startTime: "10:00",
    endTime: "18:00",
    zoneName: "Floor",
  },
  {
    assignmentEmail: "harry.green@demo.rocketrota.test",
    dayOffset: 3,
    startTime: "16:00",
    endTime: "00:00",
    zoneName: "Cocktail Bar",
  },
  {
    assignmentEmail: "james.patel@demo.rocketrota.test",
    dayOffset: 4,
    startTime: "14:00",
    endTime: "22:00",
    zoneName: "Kitchen",
  },
  {
    assignmentEmail: "noah.wilson@demo.rocketrota.test",
    dayOffset: 4,
    startTime: "18:00",
    endTime: "02:00",
    zoneName: "Entrance",
  },
  {
    assignmentEmail: DEMO_ACCOUNT_EMAIL,
    dayOffset: 5,
    startTime: "09:00",
    endTime: "17:00",
    zoneName: "Main Bar",
  },
  {
    assignmentEmail: "isla.scott@demo.rocketrota.test",
    dayOffset: 5,
    startTime: "15:00",
    endTime: "23:00",
    zoneName: "Floor",
  },
  {
    assignmentEmail: "oscar.king@demo.rocketrota.test",
    dayOffset: 5,
    startTime: "13:00",
    endTime: "21:00",
    zoneName: "Kitchen",
  },
  {
    assignmentEmail: "archie.young@demo.rocketrota.test",
    dayOffset: 5,
    startTime: "19:00",
    endTime: "02:00",
    zoneName: "Entrance",
  },
  {
    assignmentEmail: "amelia.hughes@demo.rocketrota.test",
    dayOffset: 6,
    startTime: "11:00",
    endTime: "19:00",
    zoneName: "Floor",
  },
  {
    assignmentEmail: "freya.hall@demo.rocketrota.test",
    dayOffset: 6,
    startTime: "12:00",
    endTime: "18:00",
    zoneName: "Entrance",
  },
  {
    assignmentEmail: "eva.brooks@demo.rocketrota.test",
    dayOffset: 6,
    startTime: "18:00",
    endTime: "22:00",
    zoneName: "Floor",
  },
]

const demoScheduledStaffCount = new Set(
  demoShifts.map((shift) => shift.assignmentEmail),
).size

async function prepareDemoAccount() {
  const database = getDatabase()
  const client = await database.connect()

  try {
    await client.query("BEGIN")

    const userId = await upsertDemoUser(client)
    const location = await upsertDemoLocation(client)

    await upsertDemoMembership(client, {
      locationId: location.id,
      userId,
    })
    await updateBillingOwner(client, {
      billingAccountId: location.billing_account_id,
      userId,
    })
    await resetDemoWorkspaceContent(client, location.id)

    const groupIdsBySlug = await upsertDemoGroups(client, location.id)
    const zoneIdsByName = await upsertDemoZones(client, location.id)
    await upsertOperatingHours(client, location.id)
    const employeeIdsByEmail = await upsertDemoEmployees(client, {
      groupIdsBySlug,
      locationId: location.id,
      userId,
    })
    await upsertDemoRota(client, {
      employeeIdsByEmail,
      locationId: location.id,
      userId,
      zoneIdsByName,
    })
    await upsertDemoTrial(client, location.id)

    await client.query("COMMIT")

    return {
      email: DEMO_ACCOUNT_EMAIL,
      password: DEMO_ACCOUNT_PASSWORD,
      redirectTo: `/w/${DEMO_LOCATION_SLUG}/dashboard`,
    }
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function upsertDemoUser(client: PoolClient) {
  const passwordHash = await hashPassword(DEMO_ACCOUNT_PASSWORD)

  const userResult = await client.query<IdRow>(
    `insert into public."user" (
       id,
       name,
       email,
       "emailVerified",
       "createdAt",
       "updatedAt"
     ) values ($1, $2, $3, true, timezone('utc', now()), timezone('utc', now()))
     on conflict (email)
     do update set
       name = excluded.name,
       "emailVerified" = true,
       "updatedAt" = timezone('utc', now())
     returning id`,
    [demoUserId, DEMO_ACCOUNT_NAME, DEMO_ACCOUNT_EMAIL],
  )
  const userId = requireFirstRow(userResult.rows).id

  await client.query(
    `delete from public."account"
     where "userId" = $1
       and "providerId" = 'credential'
       and id <> $2`,
    [userId, demoCredentialAccountId],
  )

  await client.query(
    `insert into public."account" (
       id,
       "accountId",
       "providerId",
       "userId",
       password,
       "createdAt",
       "updatedAt"
     ) values ($1, $2, 'credential', $2, $3, timezone('utc', now()), timezone('utc', now()))
     on conflict (id)
     do update set
       "accountId" = excluded."accountId",
       "providerId" = excluded."providerId",
       "userId" = excluded."userId",
       password = excluded.password,
       "updatedAt" = timezone('utc', now())`,
    [demoCredentialAccountId, userId, passwordHash],
  )

  return userId
}

async function upsertDemoLocation(client: PoolClient) {
  const existingResult = await client.query<LocationRow>(
    `select id, billing_account_id
     from public.locations
     where organization_id is null
       and slug = $1
     limit 1`,
    [DEMO_LOCATION_SLUG],
  )
  const existing = existingResult.rows[0]

  if (existing) {
    await client.query(
      `update public.locations
       set name = $2,
           updated_at = timezone('utc', now())
       where id = $1`,
      [existing.id, DEMO_LOCATION_NAME],
    )

    return existing
  }

  const billingAccountResult = await client.query<IdRow>(
    `insert into public.billing_accounts (
       scope,
       organization_id,
       location_id,
       status,
       created_at,
       updated_at
     ) values ('location', null, null, 'incomplete', timezone('utc', now()), timezone('utc', now()))
     returning id`,
  )
  const billingAccountId = requireFirstRow(billingAccountResult.rows).id
  const result = await client.query<LocationRow>(
    `insert into public.locations (
       organization_id,
       name,
       slug,
       billing_account_id,
       created_at,
       updated_at
     ) values (null, $1, $2, $3, timezone('utc', now()), timezone('utc', now()))
     returning id, billing_account_id`,
    [DEMO_LOCATION_NAME, DEMO_LOCATION_SLUG, billingAccountId],
  )
  const location = requireFirstRow(result.rows)

  await client.query(
    `update public.billing_accounts
     set location_id = $2,
         updated_at = timezone('utc', now())
     where id = $1`,
    [billingAccountId, location.id],
  )

  return location
}

async function upsertDemoMembership(
  client: PoolClient,
  input: {
    locationId: string
    userId: string
  },
) {
  await client.query(
    `insert into public.location_memberships (
       location_id,
       user_id,
       role,
       created_at,
       updated_at
     ) values ($1, $2, 'owner', timezone('utc', now()), timezone('utc', now()))
     on conflict (location_id, user_id)
     do update set
       role = 'owner',
       updated_at = timezone('utc', now())`,
    [input.locationId, input.userId],
  )
}

async function updateBillingOwner(
  client: PoolClient,
  input: {
    billingAccountId: string
    userId: string
  },
) {
  await client.query(
    `update public.billing_accounts
     set owner_user_id = $2,
         status = 'incomplete',
         updated_at = timezone('utc', now())
     where id = $1
       and stripe_customer_id is null`,
    [input.billingAccountId, input.userId],
  )
}

async function resetDemoWorkspaceContent(
  client: PoolClient,
  locationId: string,
) {
  await client.query(
    `delete from public.rotas
     where organization_id is null
       and location_id = $1`,
    [locationId],
  )
  await client.query(
    `delete from public.employees
     where organization_id is null
       and location_id = $1`,
    [locationId],
  )
  await client.query(
    `delete from public.zones
     where organization_id is null
       and location_id = $1`,
    [locationId],
  )
  await client.query(
    `delete from public.staff_groups
     where organization_id is null
       and location_id = $1`,
    [locationId],
  )
}

async function upsertDemoGroups(client: PoolClient, locationId: string) {
  const groupIdsBySlug = new Map<DemoEmployeeSeed["groupSlug"], string>()

  for (const group of demoGroups) {
    const result = await client.query<IdRow>(
      `insert into public.staff_groups (
         organization_id,
         location_id,
         name,
         slug,
         color,
         is_default,
         created_at,
         updated_at
       ) values (null, $1, $2, $3, $4, $5, timezone('utc', now()), timezone('utc', now()))
       on conflict (location_id, slug)
       where location_id is not null
       do update set
         name = excluded.name,
         color = excluded.color,
         is_default = excluded.is_default,
         updated_at = timezone('utc', now())
       returning id`,
      [
        locationId,
        group.name,
        group.slug,
        group.color,
        group.slug === "bar",
      ],
    )
    groupIdsBySlug.set(group.slug, requireFirstRow(result.rows).id)
  }

  return groupIdsBySlug
}

async function upsertDemoZones(client: PoolClient, locationId: string) {
  const zoneIdsByName = new Map<string, string>()

  for (const [index, name] of demoZones.entries()) {
    const result = await client.query<IdRow>(
      `insert into public.zones (
         organization_id,
         location_id,
         name,
         sort_order,
         created_at,
         updated_at
       ) values (null, $1, $2, $3, timezone('utc', now()), timezone('utc', now()))
       on conflict (location_id, name)
       do update set
         sort_order = excluded.sort_order,
         updated_at = timezone('utc', now())
       returning id`,
      [locationId, name, index],
    )
    zoneIdsByName.set(name, requireFirstRow(result.rows).id)
  }

  return zoneIdsByName
}

async function upsertOperatingHours(client: PoolClient, locationId: string) {
  const closeTimes = [
    "23:00",
    "23:00",
    "23:00",
    "23:30",
    "00:30",
    "01:00",
    "22:00",
  ]

  for (const [index, closeTime] of closeTimes.entries()) {
    await client.query(
      `insert into public.location_operating_hours (
         organization_id,
         location_id,
         weekday,
         close_time,
         created_at,
         updated_at
       ) values (null, $1, $2, $3, timezone('utc', now()), timezone('utc', now()))
       on conflict (location_id, weekday)
       do update set
         close_time = excluded.close_time,
         updated_at = timezone('utc', now())`,
      [locationId, index + 1, closeTime],
    )
  }
}

async function upsertDemoEmployees(
  client: PoolClient,
  input: {
    groupIdsBySlug: Map<DemoEmployeeSeed["groupSlug"], string>
    locationId: string
    userId: string
  },
) {
  const employeeIdsByEmail = new Map<string, string>()

  for (const employee of demoEmployees) {
    const employeeId = await upsertDemoEmployee(client, {
      ...employee,
      locationId: input.locationId,
      staffGroupId: requireMapValue(input.groupIdsBySlug, employee.groupSlug),
      userId: employee.email === DEMO_ACCOUNT_EMAIL ? input.userId : null,
    })
    employeeIdsByEmail.set(employee.email, employeeId)

    await client.query(
      `insert into public.employee_location_assignments (
         organization_id,
         employee_id,
         location_id,
         is_enabled,
         created_at
       ) values (null, $1, $2, true, timezone('utc', now()))
       on conflict (employee_id, location_id)
       do update set
         is_enabled = true,
         disabled_at = null`,
      [employeeId, input.locationId],
    )
  }

  return employeeIdsByEmail
}

async function upsertDemoEmployee(
  client: PoolClient,
  input: DemoEmployeeSeed & {
    locationId: string
    staffGroupId: string
    userId: string | null
  },
) {
  const existingResult = await client.query<IdRow>(
    `select id
     from public.employees
     where location_id = $1
       and email = $2
     limit 1`,
    [input.locationId, input.email],
  )
  const existing = existingResult.rows[0]

  if (existing) {
    await client.query(
      `update public.employees
       set user_id = $2,
           staff_group_id = $3,
           full_name = $4,
           status = $5,
           updated_at = timezone('utc', now())
       where id = $1`,
      [
        existing.id,
        input.userId,
        input.staffGroupId,
        input.fullName,
        input.status ?? "active",
      ],
    )

    return existing.id
  }

  const insertResult = await client.query<IdRow>(
    `insert into public.employees (
       organization_id,
       location_id,
       user_id,
       staff_group_id,
       full_name,
       email,
       status,
       created_at,
       updated_at
     ) values (null, $1, $2, $3, $4, $5, $6, timezone('utc', now()), timezone('utc', now()))
     returning id`,
    [
      input.locationId,
      input.userId,
      input.staffGroupId,
      input.fullName,
      input.email,
      input.status ?? "active",
    ],
  )

  return requireFirstRow(insertResult.rows).id
}

async function upsertDemoRota(
  client: PoolClient,
  input: {
    employeeIdsByEmail: Map<string, string>
    locationId: string
    userId: string
    zoneIdsByName: Map<string, string>
  },
) {
  const weekStart = format(
    startOfWeek(new Date(), {
      weekStartsOn: 1,
    }),
    "yyyy-MM-dd",
  )
  const rotaId = await upsertDemoRotaRecord(client, {
    locationId: input.locationId,
    userId: input.userId,
    weekStart,
  })

  await client.query(
    `delete from public.rota_published_shifts where rota_id = $1`,
    [rotaId],
  )
  await client.query(`delete from public.rota_shifts where rota_id = $1`, [
    rotaId,
  ])

  for (const shift of demoShifts) {
    const dayDate = format(
      addDays(parseISO(weekStart), shift.dayOffset),
      "yyyy-MM-dd",
    )
    const zoneId = requireMapValue(input.zoneIdsByName, shift.zoneName)
    const employeeId = requireMapValue(
      input.employeeIdsByEmail,
      shift.assignmentEmail,
    )
    const workingShiftId = await insertDemoShift(client, {
      dayDate,
      endTime: shift.endTime,
      rotaId,
      startTime: shift.startTime,
      zoneId,
      zoneName: shift.zoneName,
    })
    const publishedShiftId = await insertDemoPublishedShift(client, {
      dayDate,
      endTime: shift.endTime,
      rotaId,
      startTime: shift.startTime,
      workingShiftId,
      zoneId,
      zoneName: shift.zoneName,
    })

    await client.query(
      `insert into public.rota_shift_assignments (
         rota_shift_id,
         employee_id,
         created_at,
         updated_at
       ) values ($1, $2, timezone('utc', now()), timezone('utc', now()))`,
      [workingShiftId, employeeId],
    )
    await client.query(
      `insert into public.rota_published_shift_assignments (
         rota_published_shift_id,
         employee_id,
         created_at,
         updated_at
       ) values ($1, $2, timezone('utc', now()), timezone('utc', now()))`,
      [publishedShiftId, employeeId],
    )
  }
}

async function upsertDemoRotaRecord(
  client: PoolClient,
  input: {
    locationId: string
    userId: string
    weekStart: string
  },
) {
  const existingResult = await client.query<IdRow>(
    `select id
     from public.rotas
     where organization_id is null
       and location_id = $1
       and week_start = $2::date
     order by created_at asc
     limit 1`,
    [input.locationId, input.weekStart],
  )
  const existing = existingResult.rows[0]

  if (existing) {
    await client.query(
      `update public.rotas
       set status = 'published',
           note = 'Demo week with a few assigned shifts.',
           shift_count = $2,
           scheduled_hours = $3,
           scheduled_staff_count = $4,
           published_at = timezone('utc', now()),
           published_by_user_id = $5,
           published_version = greatest(published_version, 1),
           published_snapshot_version = greatest(published_snapshot_version, 1),
           has_unpublished_changes = false,
           updated_at = timezone('utc', now())
       where id = $1`,
      [
        existing.id,
        demoShifts.length,
        demoShifts.length * 8,
        demoScheduledStaffCount,
        input.userId,
      ],
    )

    return existing.id
  }

  const insertResult = await client.query<IdRow>(
    `insert into public.rotas (
       organization_id,
       location_id,
       week_start,
       status,
       note,
       shift_count,
       scheduled_hours,
       scheduled_staff_count,
       created_by,
       published_at,
       published_by_user_id,
       published_version,
       published_snapshot_version,
       has_unpublished_changes,
       source_type,
       created_at,
       updated_at
     ) values (
       null,
       $1,
       $2::date,
       'published',
       'Demo week with a few assigned shifts.',
       $3,
       $4,
       $5,
       $6,
       timezone('utc', now()),
       $6,
       1,
       1,
       false,
       'blank',
       timezone('utc', now()),
       timezone('utc', now())
     )
     returning id`,
    [
      input.locationId,
      input.weekStart,
      demoShifts.length,
      demoShifts.length * 8,
      demoScheduledStaffCount,
      input.userId,
    ],
  )

  return requireFirstRow(insertResult.rows).id
}

async function insertDemoShift(
  client: PoolClient,
  input: {
    dayDate: string
    endTime: string
    rotaId: string
    startTime: string
    zoneId: string
    zoneName: string
  },
) {
  const result = await client.query<IdRow>(
    `insert into public.rota_shifts (
       rota_id,
       organization_id,
       day_date,
       zone_id,
       zone_name_snapshot,
       shift_type,
       start_time,
       end_time,
       created_at,
       updated_at
     ) values ($1, null, $2::date, $3, $4, 'standard', $5::time, $6::time, timezone('utc', now()), timezone('utc', now()))
     returning id`,
    [
      input.rotaId,
      input.dayDate,
      input.zoneId,
      input.zoneName,
      input.startTime,
      input.endTime,
    ],
  )

  return requireFirstRow(result.rows).id
}

async function insertDemoPublishedShift(
  client: PoolClient,
  input: {
    dayDate: string
    endTime: string
    rotaId: string
    startTime: string
    workingShiftId: string
    zoneId: string
    zoneName: string
  },
) {
  const result = await client.query<IdRow>(
    `insert into public.rota_published_shifts (
       rota_id,
       organization_id,
       working_shift_id,
       day_date,
       zone_id,
       zone_name_snapshot,
       shift_type,
       start_time,
       end_time,
       created_at,
       updated_at
     ) values ($1, null, $2, $3::date, $4, $5, 'standard', $6::time, $7::time, timezone('utc', now()), timezone('utc', now()))
     returning id`,
    [
      input.rotaId,
      input.workingShiftId,
      input.dayDate,
      input.zoneId,
      input.zoneName,
      input.startTime,
      input.endTime,
    ],
  )

  return requireFirstRow(result.rows).id
}

async function upsertDemoTrial(client: PoolClient, locationId: string) {
  await client.query(
    `insert into public.workspace_trials (
       scope,
       location_id,
       status,
       trial_started_at,
       trial_ends_at,
       created_at,
       updated_at
     ) values (
       'location',
       $1,
       'active',
       timezone('utc', now()),
       timezone('utc', now()) + interval '10 years',
       timezone('utc', now()),
       timezone('utc', now())
     )
     on conflict (location_id)
     where location_id is not null
     do update set
       status = 'active',
       trial_ends_at = timezone('utc', now()) + interval '10 years',
       updated_at = timezone('utc', now())`,
    [locationId],
  )
}

function requireFirstRow<T>(rows: T[]) {
  const row = rows[0]

  if (!row) {
    throw new Error("Demo data could not be prepared.")
  }

  return row
}

function requireMapValue<K, V>(map: Map<K, V>, key: K) {
  const value = map.get(key)

  if (!value) {
    throw new Error("Demo data is missing a required seed value.")
  }

  return value
}

export { prepareDemoAccount }
