import { QueryClient, QueryObserver } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import { applyCreatedLocation } from "./location-mutation-cache"
import { applyZoneCacheChange } from "./zone-mutation-cache"
import type {
  LocationSettingsItem,
  LocationSettingsPageData,
  RotaSettingsPageData,
} from "@/features/settings/types"
import { settingsQueryKeys } from "@/features/settings/query-keys"
import { DEFAULT_ROTA_SETTINGS } from "@/features/rota/constants/rota-settings"
import { navigationQueryKeys } from "@/features/navigation/query-keys"

const scope = { organizationId: "org", userId: "user" }
const location: LocationSettingsItem = {
  id: "location",
  name: "Cafe",
  slug: "cafe",
  address: null,
  employeeCount: 0,
  zoneCount: 1,
  zones: [{ id: "zone", name: "Main", sortOrder: 0 }],
  daySettings: [],
  estimatedClosingTime: "23:00",
  estimatedClosingTimeNextDay: false,
}
const rota: RotaSettingsPageData = {
  locations: [
    {
      id: location.id,
      name: location.name,
      slug: location.slug,
      zones: location.zones,
      settings: { ...DEFAULT_ROTA_SETTINGS, defaultZoneId: "zone" },
    },
  ],
  templates: [],
  shiftSwapsEnabled: false,
}
const clients: Array<QueryClient> = []
afterEach(() => clients.splice(0).forEach((client) => client.clear()))
function seed() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  })
  clients.push(client)
  client.setQueryData(settingsQueryKeys.rota(scope), rota)
  client.setQueryData<LocationSettingsPageData>(
    settingsQueryKeys.locations(scope),
    { locations: [location], totalEmployeeCount: 0 }
  )
  return client
}

describe("confirmed settings writes", () => {
  it("updates zone lists and counts without refetching unread notifications", async () => {
    const client = seed()
    const unread = vi.fn().mockResolvedValue(false)
    const key = ["rota", "unread-updates", scope]
    client.setQueryData(key, false)
    const observer = new QueryObserver(client, {
      queryKey: key,
      queryFn: unread,
      staleTime: Infinity,
    })
    const unsubscribe = observer.subscribe(() => {})
    const preview = [
      "rota",
      "creation-preview",
      { locationId: "location", weekStart: "week" },
    ]
    client.setQueryData(preview, {})
    await applyZoneCacheChange(client, scope, {
      type: "created",
      locationId: "location",
      zone: { id: "new", name: "Bar", sortOrder: 1 },
    })
    expect(
      client.getQueryData<RotaSettingsPageData>(settingsQueryKeys.rota(scope))
        ?.locations[0].zones
    ).toHaveLength(2)
    expect(
      client.getQueryData<LocationSettingsPageData>(
        settingsQueryKeys.locations(scope)
      )?.locations[0].zoneCount
    ).toBe(2)
    expect(unread).not.toHaveBeenCalled()
    expect(client.getQueryState(key)?.isInvalidated).toBe(false)
    expect(client.getQueryState(preview)?.isInvalidated).toBe(true)
    unsubscribe()
  })

  it("patches names and clears an archived default zone", async () => {
    const client = seed()
    await applyZoneCacheChange(client, scope, {
      type: "renamed",
      id: "zone",
      locationId: "location",
      name: "Kitchen",
    })
    expect(
      client.getQueryData<RotaSettingsPageData>(settingsQueryKeys.rota(scope))
        ?.locations[0].zones[0].name
    ).toBe("Kitchen")
    await applyZoneCacheChange(client, scope, {
      type: "archived",
      id: "zone",
      locationId: "location",
    })
    const data = client.getQueryData<RotaSettingsPageData>(
      settingsQueryKeys.rota(scope)
    )
    expect(data?.locations[0].zones).toEqual([])
    expect(data?.locations[0].settings.defaultZoneId).toBeNull()
  })

  it("leaves other organisations and users untouched", async () => {
    const client = seed()
    const otherOrg = settingsQueryKeys.rota({
      ...scope,
      organizationId: "other",
    })
    const otherUser = settingsQueryKeys.rota({ ...scope, userId: "other-user" })
    client.setQueryData(otherOrg, rota)
    client.setQueryData(otherUser, rota)
    await applyZoneCacheChange(client, scope, {
      type: "renamed",
      id: "zone",
      locationId: "location",
      name: "Changed",
    })
    expect(client.getQueryData(otherOrg)).toEqual(rota)
    expect(client.getQueryData(otherUser)).toEqual(rota)
  })

  it("discards an older in-flight refresh instead of overwriting the save", async () => {
    const client = seed()
    let complete = (_value: RotaSettingsPageData) => {}
    const refresh = client
      .fetchQuery({
        queryKey: settingsQueryKeys.rota(scope),
        staleTime: 0,
        queryFn: () =>
          new Promise<RotaSettingsPageData>((resolve) => {
            complete = resolve
          }),
      })
      .catch(() => undefined)
    await applyZoneCacheChange(client, scope, {
      type: "renamed",
      id: "zone",
      locationId: "location",
      name: "Kitchen",
    })
    complete(rota)
    await refresh
    expect(
      client.getQueryData<RotaSettingsPageData>(settingsQueryKeys.rota(scope))
        ?.locations[0].zones[0].name
    ).toBe("Kitchen")
  })

  it("appends the actual new location without refreshing navigation or other location scopes", async () => {
    const client = seed()
    const narrow = settingsQueryKeys.locations({
      ...scope,
      locationId: "location",
    })
    client.setQueryData(narrow, {
      locations: [location],
      totalEmployeeCount: 0,
    })
    const viewerKey = navigationQueryKeys.workspace({
      workspaceSlug: "cafe",
      sessionId: "session",
      userId: "user",
    })
    const otherViewerKey = navigationQueryKeys.workspace({
      workspaceSlug: "other",
      sessionId: "session",
      userId: "user",
    })
    client.setQueryData(viewerKey, {
      user: { id: "user" },
      activeWorkspace: { id: "org" },
    })
    client.setQueryData(otherViewerKey, {
      user: { id: "user" },
      activeWorkspace: { id: "other" },
    })
    await applyCreatedLocation(client, scope, {
      ...location,
      id: "new-location",
      name: "Second",
    })
    expect(
      client.getQueryData<LocationSettingsPageData>(
        settingsQueryKeys.locations(scope)
      )?.locations
    ).toHaveLength(2)
    expect(
      client.getQueryData<LocationSettingsPageData>(narrow)?.locations
    ).toHaveLength(1)
    expect(
      client.getQueryState(settingsQueryKeys.rota(scope))?.isInvalidated
    ).toBe(true)
    expect(client.getQueryState(viewerKey)?.isInvalidated).toBe(true)
    expect(client.getQueryState(otherViewerKey)?.isInvalidated).toBe(false)
  })
})
