import { requireSettingsLocationWriteAccess } from "./location-write-access"
import type { z } from "zod"
import type { createZoneInputSchema } from "@/features/settings/schemas/rota-settings-schemas"
import type { RotaSettingsZone } from "@/features/settings/types"
import { getDatabase } from "@/lib/db"

async function createZone(
  input: z.infer<typeof createZoneInputSchema>
): Promise<RotaSettingsZone & { locationId: string }> {
  await requireSettingsLocationWriteAccess(input, "update")
  const result = await getDatabase().query<{
    target_location_id: string
    id: string | null
    name: string | null
    sort_order: number | null
  }>(
    `with target_location as (
       select id, organization_id from public.locations
       where id = $2::uuid and ($1::text is null or organization_id = $1::text)
     ), inserted_zone as (
       insert into public.zones (organization_id, location_id, name, sort_order)
       select location.organization_id, location.id, $3,
              coalesce((select max(zone.sort_order) + 1 from public.zones zone
                        where zone.location_id = location.id and zone.deleted_at is null), 0)
       from target_location location
       on conflict (location_id, (lower(name))) where deleted_at is null do nothing
       returning id, name, sort_order
     )
     select location.id as target_location_id, zone.id, zone.name, zone.sort_order
     from target_location location left join inserted_zone zone on true`,
    [input.organizationId ?? null, input.locationId, input.name.trim()]
  )
  const row = result.rows.at(0)
  if (!row) throw new Error("Choose a valid location.")
  if (!row.id || row.name === null || row.sort_order === null) {
    throw new Error("That zone name already exists for this location.")
  }
  return {
    id: row.id,
    locationId: row.target_location_id,
    name: row.name,
    sortOrder: row.sort_order,
  }
}

export { createZone }
