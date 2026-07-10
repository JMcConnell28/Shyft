import { getDatabase } from "@/lib/db"

import { requireLocationPermission } from "@/lib/auth/has-location-permission"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

async function createZone(input: {
  organizationId?: string
  userId: string
  locationId: string
  name: string
}) {
  await requireZonePermission(input)

  const database = getDatabase()
  const normalizedName = input.name.trim()
  const location = await getLocationForWorkspace(database, input)
  await assertUniqueZoneName(database, {
    organizationId: location.organizationId,
    locationId: input.locationId,
    name: normalizedName,
  })

  const result = await database.query<{
    id: string
    location_id: string
    name: string
    sort_order: number
  }>(
    `insert into public.zones (
       organization_id,
       location_id,
       name,
       sort_order
     )
     values (
       $1,
       $2,
       $3,
       (
         select coalesce(max(z.sort_order) + 1, 0)
         from public.zones z
         where (($1::text is null and z.organization_id is null) or z.organization_id = $1::text)
           and z.location_id = $2::uuid
           and z.deleted_at is null
       )
     )
     returning id, location_id, name, sort_order`,
    [location.organizationId, input.locationId, normalizedName]
  )

  return {
    id: result.rows[0]?.id ?? "",
    locationId: result.rows[0]?.location_id ?? input.locationId,
    name: result.rows[0]?.name ?? normalizedName,
    sortOrder: result.rows[0]?.sort_order ?? 0,
  }
}

async function updateZone(input: {
  organizationId?: string
  locationId?: string
  userId: string
  zoneId: string
  name: string
}) {
  await requireZonePermission(input)

  const database = getDatabase()
  const normalizedName = input.name.trim()
  const zone = await getZoneForWorkspace(database, input)

  await assertUniqueZoneName(database, {
    organizationId: input.organizationId ?? null,
    locationId: zone.locationId,
    name: normalizedName,
    excludeZoneId: input.zoneId,
  })

  await database.query(
    `update public.zones
     set name = $3,
         updated_at = timezone('utc', now())
     where id = $2::uuid
       and (
         ($1::text is not null and organization_id = $1::text)
         or ($4::uuid is not null and location_id = $4::uuid)
       )`,
    [
      input.organizationId ?? null,
      input.zoneId,
      normalizedName,
      input.locationId ?? null,
    ]
  )

  return {
    id: input.zoneId,
    locationId: zone.locationId,
    name: normalizedName,
  }
}

async function deleteZone(input: {
  organizationId?: string
  locationId?: string
  userId: string
  zoneId: string
}) {
  await requireZonePermission(input)

  const database = getDatabase()
  const zone = await getZoneForWorkspace(database, input)

  const zoneCountResult = await database.query<{ count: string }>(
    `select count(*)::text as count
     from public.zones
     where (
         ($1::text is not null and organization_id = $1::text)
         or ($3::uuid is not null and location_id = $3::uuid)
       )
       and location_id = $2::uuid
       and deleted_at is null`,
    [input.organizationId ?? null, zone.locationId, input.locationId ?? null]
  )

  if (Number(zoneCountResult.rows[0]?.count ?? "0") <= 1) {
    throw new Error(
      "Each location needs at least one zone. Create another zone first."
    )
  }

  await database.query(
    `update public.zones
     set deleted_at = timezone('utc', now()),
         updated_at = timezone('utc', now())
     where id = $2::uuid
       and (
         ($1::text is not null and organization_id = $1::text)
         or ($3::uuid is not null and location_id = $3::uuid)
       )
       and deleted_at is null`,
    [input.organizationId ?? null, input.zoneId, input.locationId ?? null]
  )

  return {
    id: input.zoneId,
  }
}

async function requireZonePermission(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  if (input.organizationId) {
    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permissions: {
        location: ["update"],
      },
      errorMessage: "You do not have permission to manage zones.",
    })
    return
  }

  if (!input.locationId) {
    throw new Error("Choose a location.")
  }

  await requireLocationPermission({
    locationId: input.locationId,
    userId: input.userId,
    permissions: {
      location: ["update"],
    },
    errorMessage: "You do not have permission to manage zones.",
  })
}

async function getLocationForWorkspace(
  database: ReturnType<typeof getDatabase>,
  input: {
    organizationId?: string
    locationId: string
  }
) {
  const result = await database.query<{
    id: string
    organization_id: string | null
  }>(
    `select id, organization_id
     from public.locations
     where id = $2::uuid
       and (
         ($1::text is not null and organization_id = $1::text)
         or $1::text is null
       )
     limit 1`,
    [input.organizationId ?? null, input.locationId]
  )
  const location = result.rows[0]

  if (!location) {
    throw new Error("Choose a valid location.")
  }

  return {
    id: location.id,
    organizationId: location.organization_id,
  }
}

async function getZoneForWorkspace(
  database: ReturnType<typeof getDatabase>,
  input: {
    organizationId?: string
    locationId?: string
    zoneId: string
  }
) {
  const result = await database.query<{
    id: string
    location_id: string
  }>(
    `select id, location_id
     from public.zones
     where (
         ($1::text is not null and organization_id = $1::text)
         or ($2::uuid is not null and location_id = $2::uuid)
       )
       and ($2::uuid is null or location_id = $2::uuid)
       and id = $3::uuid
       and deleted_at is null
     limit 1`,
    [input.organizationId ?? null, input.locationId ?? null, input.zoneId]
  )

  const zone = result.rows[0]

  if (!zone) {
    throw new Error("Choose a valid zone.")
  }

  return {
    id: zone.id,
    locationId: zone.location_id,
  }
}

async function assertUniqueZoneName(
  database: ReturnType<typeof getDatabase>,
  input: {
    organizationId: string | null
    locationId: string
    name: string
    excludeZoneId?: string
  }
) {
  const result = await database.query<{ id: string }>(
    `select id
     from public.zones
     where (
         ($1::text is not null and organization_id = $1::text)
         or ($2::uuid is not null and location_id = $2::uuid)
       )
       and location_id = $2::uuid
       and lower(name) = lower($3)
       and deleted_at is null
       and ($4::uuid is null or id <> $4::uuid)
     limit 1`,
    [
      input.organizationId,
      input.locationId,
      input.name,
      input.excludeZoneId ?? null,
    ]
  )

  if (result.rows[0]) {
    throw new Error("That zone name already exists for this location.")
  }
}

export { createZone, deleteZone, updateZone }
