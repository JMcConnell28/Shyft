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
  await assertLocationExists(database, input)
  await assertUniqueZoneName(database, {
    organizationId: input.organizationId ?? null,
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
       )
     )
     returning id, location_id, name, sort_order`,
    [input.organizationId ?? null, input.locationId, normalizedName],
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
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and id = $2::uuid`,
    [input.organizationId ?? null, input.zoneId, normalizedName],
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
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and location_id = $2::uuid`,
    [input.organizationId ?? null, zone.locationId],
  )

  if (Number(zoneCountResult.rows[0]?.count ?? "0") <= 1) {
    throw new Error("Each location needs at least one zone. Create another zone first.")
  }

  const usageResult = await database.query<{ used: boolean }>(
    `select exists(
       select 1
       from public.rota_shifts
       where (($1::text is null and organization_id is null) or organization_id = $1::text)
         and zone_id = $2::uuid
     ) as used`,
    [input.organizationId ?? null, input.zoneId],
  )

  if (usageResult.rows[0]?.used) {
    throw new Error(
      "This zone is still used in editable rotas. Move or remove those shifts before deleting it.",
    )
  }

  await database.query(
    `delete from public.zones
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and id = $2::uuid`,
    [input.organizationId ?? null, input.zoneId],
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

async function assertLocationExists(
  database: ReturnType<typeof getDatabase>,
  input: {
    organizationId?: string
    locationId: string
  },
) {
  const result = await database.query<{ id: string }>(
    `select id
     from public.locations
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and id = $2::uuid
     limit 1`,
    [input.organizationId ?? null, input.locationId],
  )

  if (!result.rows[0]) {
    throw new Error("Choose a valid location.")
  }
}

async function getZoneForWorkspace(
  database: ReturnType<typeof getDatabase>,
  input: {
    organizationId?: string
    locationId?: string
    zoneId: string
  },
) {
  const result = await database.query<{
    id: string
    location_id: string
  }>(
    `select id, location_id
     from public.zones
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and ($2::uuid is null or location_id = $2::uuid)
       and id = $3::uuid
     limit 1`,
    [input.organizationId ?? null, input.locationId ?? null, input.zoneId],
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
  },
) {
  const result = await database.query<{ id: string }>(
    `select id
     from public.zones
     where (($1::text is null and organization_id is null) or organization_id = $1::text)
       and location_id = $2::uuid
       and lower(name) = lower($3)
       and ($4::uuid is null or id <> $4::uuid)
     limit 1`,
    [
      input.organizationId,
      input.locationId,
      input.name,
      input.excludeZoneId ?? null,
    ],
  )

  if (result.rows[0]) {
    throw new Error("That zone name already exists for this location.")
  }
}

export { createZone, deleteZone, updateZone }
