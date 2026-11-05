import type { PoolClient } from "pg"
import type { RotaSettingsZone } from "@/features/settings/types"

async function createLocationPlaces(
  client: PoolClient,
  input: {
    organizationId: string
    locationId: string
    planningMode: "fixed_location" | "variable_location"
    zoneNames: Array<string>
    worksiteName: string
  }
): Promise<Array<RotaSettingsZone>> {
  if (input.planningMode === "fixed_location") {
    const names = [
      ...new Map(
        input.zoneNames
          .map((name) => name.trim())
          .filter(Boolean)
          .map((name) => [name.toLowerCase(), name])
      ).values(),
    ]
    const result = await client.query<{
      id: string
      name: string
      sort_order: number
    }>(
      `insert into public.zones (organization_id, location_id, name, sort_order)
       select $1, $2::uuid, zone.name, (zone.position - 1)::integer
       from unnest($3::text[]) with ordinality as zone(name, position)
       returning id, name, sort_order`,
      [
        input.organizationId,
        input.locationId,
        names.length ? names : ["Main area"],
      ]
    )
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      sortOrder: row.sort_order,
    }))
  }
  if (input.worksiteName.trim()) {
    await client.query(
      `insert into public.worksites (organization_id, location_id, name, sort_order)
       values ($1, $2, $3, 0) on conflict (location_id, lower(name)) do nothing`,
      [input.organizationId, input.locationId, input.worksiteName.trim()]
    )
  }
  return []
}

export { createLocationPlaces }
