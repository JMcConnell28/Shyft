import type { PoolClient } from "pg"

import { getDatabase } from "@/lib/db"
import { slugify } from "@/lib/slug"

import { requireOrgPermission } from "@/lib/auth/has-org-permission"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"

async function createLocation(input: {
  organizationId: string
  userId: string
  name: string
  businessType: string
  planningMode: "fixed_location" | "variable_location"
  zoneNames: string[]
  worksiteName: string
}) {
  await requireOrgPermission({
    organizationId: input.organizationId,
    userId: input.userId,
    permissions: {
      location: ["create"],
    },
    errorMessage: "You do not have permission to create locations.",
  })

  const database = getDatabase()
  const locationName = input.name.trim()
  const locationSlug = await createUniqueLocationSlug({
    organizationId: input.organizationId,
    name: locationName,
  })
  const placeNames = getUniqueNames(input.zoneNames)
  const client = await database.connect()

  try {
    await client.query("BEGIN")

    const locationResult = await client.query<{
      id: string
      name: string
      slug: string
    }>(
      `insert into public.locations (
         organization_id,
         name,
         slug,
         business_type,
         planning_mode
       ) values ($1, $2, $3, $4, $5)
       returning id, name, slug`,
      [
        input.organizationId,
        locationName,
        locationSlug,
        input.businessType,
        input.planningMode,
      ]
    )
    const location = locationResult.rows.at(0)

    if (!location) {
      throw new Error("We could not create that location.")
    }

    await createInitialPlaces({
      client,
      organizationId: input.organizationId,
      locationId: location.id,
      planningMode: input.planningMode,
      zoneNames: placeNames,
      worksiteName: input.worksiteName,
    })

    await client.query("COMMIT")

    return {
      id: location.id,
      name: location.name,
      slug: location.slug,
    }
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function updateLocationSettings(input: {
  organizationId?: string
  workspaceLocationId?: string
  locationId: string
  daySettings: Array<{
    closeTime: string
    closeTimeNextDay: boolean
    weekday: number
  }>
  userId: string
  estimatedClosingTime: string
  estimatedClosingTimeNextDay: boolean
}) {
  if (input.organizationId) {
    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permissions: {
        location: ["update"],
      },
      errorMessage: "You do not have permission to update location settings.",
    })
  } else {
    await requireLocationPermission({
      locationId: input.locationId,
      userId: input.userId,
      permissions: {
        location: ["update"],
      },
      errorMessage: "You do not have permission to update location settings.",
    })
  }

  const database = getDatabase()
  const client = await database.connect()

  try {
    await client.query("BEGIN")

    await client.query(
      `update public.locations
       set estimated_closing_time = $3,
           estimated_closing_time_next_day = $4,
           updated_at = timezone('utc', now())
       where id = $1
         and ($2::text is null or organization_id = $2)`,
      [
        input.locationId,
        input.organizationId ?? null,
        input.estimatedClosingTime,
        input.estimatedClosingTimeNextDay,
      ],
    )

    await client.query(
      `delete from public.location_operating_hours
       where location_id = $1`,
      [input.locationId],
    )

    if (input.daySettings.length > 0) {
      const values = input.daySettings
        .map(
          (_, index) =>
            `($1, $2, $${index * 3 + 3}, $${index * 3 + 4}, $${index * 3 + 5})`,
        )
        .join(", ")
      const parameters = [
        input.organizationId ?? null,
        input.locationId,
        ...input.daySettings.flatMap((day) => [
          day.weekday,
          day.closeTime,
          day.closeTimeNextDay,
        ]),
      ]

      await client.query(
        `insert into public.location_operating_hours (
           organization_id,
           location_id,
           weekday,
           close_time,
           close_time_next_day
         ) values ${values}`,
        parameters,
      )
    }

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }

  return {
    daySettings: input.daySettings,
    locationId: input.locationId,
    estimatedClosingTime: input.estimatedClosingTime,
    estimatedClosingTimeNextDay: input.estimatedClosingTimeNextDay,
  }
}

function getUniqueNames(names: string[]) {
  return Array.from(
    new Map(
      names
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => [name.toLowerCase(), name])
    ).values()
  )
}

async function createUniqueLocationSlug(input: {
  organizationId: string
  name: string
}) {
  const database = getDatabase()
  const baseSlug = slugify(input.name) || "location"
  let nextSlug = baseSlug
  let counter = 2

  for (;;) {
    const result = await database.query<{ id: string }>(
      `select id
       from public.locations
       where organization_id = $1
         and slug = $2
       limit 1`,
      [input.organizationId, nextSlug]
    )

    if (!result.rows[0]) {
      return nextSlug
    }

    nextSlug = `${baseSlug}-${counter}`
    counter += 1
  }
}

async function createInitialPlaces(input: {
  client: PoolClient
  organizationId: string
  locationId: string
  planningMode: "fixed_location" | "variable_location"
  zoneNames: string[]
  worksiteName: string
}) {
  if (input.planningMode === "fixed_location") {
    const zoneNames = input.zoneNames.length > 0 ? input.zoneNames : ["Main area"]

    for (const [sortOrder, zoneName] of zoneNames.entries()) {
      await input.client.query(
        `insert into public.zones (
           organization_id,
           location_id,
           name,
           sort_order
         ) values ($1, $2, $3, $4)
         on conflict (location_id, (lower(name))) where deleted_at is null do nothing`,
        [input.organizationId, input.locationId, zoneName, sortOrder]
      )
    }

    return
  }

  const worksiteName = input.worksiteName.trim()

  if (!worksiteName) {
    return
  }

  await input.client.query(
    `insert into public.worksites (
       organization_id,
       location_id,
       name,
       sort_order
     ) values ($1, $2, $3, 0)
     on conflict (location_id, lower(name)) do nothing`,
    [input.organizationId, input.locationId, worksiteName]
  )
}

export { createLocation, updateLocationSettings }
