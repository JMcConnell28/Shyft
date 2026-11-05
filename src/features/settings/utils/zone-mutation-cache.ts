import {
  invalidateSettingsRotaDependencies,
  matchesSettingsScope,
} from "./settings-cache-scope"
import type { QueryClient } from "@tanstack/react-query"
import type { WorkspaceSettingsInput } from "@/features/settings/query-options"
import type {
  LocationSettingsPageData,
  RotaSettingsPageData,
  RotaSettingsZone,
} from "@/features/settings/types"

type ZoneCacheChange =
  | { type: "created"; locationId: string; zone: RotaSettingsZone }
  | { type: "renamed"; locationId: string; id: string; name: string }
  | { type: "archived"; id: string; locationId: string }

function updateZones(
  zones: Array<RotaSettingsZone>,
  locationId: string,
  change: ZoneCacheChange
): Array<RotaSettingsZone> {
  if (change.type === "archived")
    return zones.filter((zone) => zone.id !== change.id)
  if (change.locationId !== locationId) return zones
  if (change.type === "renamed")
    return zones.map((zone) =>
      zone.id === change.id ? { ...zone, name: change.name } : zone
    )
  return [
    ...zones.filter((zone) => zone.id !== change.zone.id),
    change.zone,
  ].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
}

async function applyZoneCacheChange(
  client: QueryClient,
  input: WorkspaceSettingsInput,
  change: ZoneCacheChange
): Promise<void> {
  const predicate = (query: { queryKey: ReadonlyArray<unknown> }) =>
    (query.queryKey[1] === "rota" || query.queryKey[1] === "locations") &&
    matchesSettingsScope(query.queryKey, input)
  // Prevent an older in-flight response from overwriting this confirmed write.
  await client.cancelQueries({ queryKey: ["settings"], predicate })
  client.setQueriesData<RotaSettingsPageData>(
    { queryKey: ["settings", "rota"], predicate },
    (data) =>
      data && {
        ...data,
        locations: data.locations.map((location) => ({
          ...location,
          zones: updateZones(location.zones, location.id, change),
          settings:
            change.type === "archived" &&
            location.settings.defaultZoneId === change.id
              ? { ...location.settings, defaultZoneId: null }
              : location.settings,
        })),
      }
  )
  client.setQueriesData<LocationSettingsPageData>(
    { queryKey: ["settings", "locations"], predicate },
    (data) =>
      data && {
        ...data,
        locations: data.locations.map((location) => {
          const zones = updateZones(location.zones, location.id, change)
          return { ...location, zones, zoneCount: zones.length }
        }),
      }
  )
  invalidateSettingsRotaDependencies(client, input, [change.locationId])
}

export { applyZoneCacheChange }
