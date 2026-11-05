import { createLocationPlaces } from "./create-location-places"
import { requireSettingsLocationWriteAccess } from "./location-write-access"
import type { z } from "zod"
import type { LocationSettingsItem } from "@/features/settings/types"
import type { createLocationInputSchema } from "@/features/settings/schemas/location-settings-schemas"
import { assertLocationNameAvailable } from "@/features/locations/server/assert-location-name-available"
import { getDatabase } from "@/lib/db"
import { slugify } from "@/lib/slug"

async function createLocation(
  input: z.infer<typeof createLocationInputSchema>
): Promise<LocationSettingsItem> {
  await requireSettingsLocationWriteAccess(input, "create")
  const client = await getDatabase().connect()
  try {
    await client.query("BEGIN")
    await assertLocationNameAvailable(client, input.organizationId, input.name)
    // The organisation's creation lock also protects slug allocation. Fetch all
    // candidates once instead of making another round trip for every suffix.
    const baseSlug = slugify(input.name) || "location"
    const existing = await client.query<{ slug: string }>(
      `select slug from public.locations where organization_id = $1
       and (slug = $2 or starts_with(slug, $2 || '-'))`,
      [input.organizationId, baseSlug]
    )
    const taken = new Set(existing.rows.map((row) => row.slug))
    let slug = baseSlug
    for (let suffix = 2; taken.has(slug); suffix++)
      slug = `${baseSlug}-${suffix}`
    const result = await client.query<{
      id: string
      name: string
      slug: string
      estimated_closing_time: string
      estimated_closing_time_next_day: boolean
    }>(
      `insert into public.locations (organization_id, name, slug, business_type, planning_mode)
       values ($1, $2, $3, $4, $5)
       returning id, name, slug, estimated_closing_time, estimated_closing_time_next_day`,
      [
        input.organizationId,
        input.name.trim(),
        slug,
        input.businessType,
        input.planningMode,
      ]
    )
    const row = result.rows.at(0)
    if (!row) throw new Error("We could not create that location.")
    const zones = await createLocationPlaces(client, {
      ...input,
      locationId: row.id,
    })
    await client.query("COMMIT")
    const closeTime = row.estimated_closing_time.slice(0, 5)
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      address: null,
      employeeCount: 0,
      zoneCount: zones.length,
      zones,
      estimatedClosingTime: closeTime,
      estimatedClosingTimeNextDay: row.estimated_closing_time_next_day,
      daySettings: Array.from({ length: 7 }, (_, i) => ({
        weekday: i + 1,
        closeTime,
        closeTimeNextDay: row.estimated_closing_time_next_day,
      })),
    }
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

export { createLocation }
