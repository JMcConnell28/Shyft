import {
  invalidateSettingsRotaDependencies,
  matchesSettingsScope,
} from "./settings-cache-scope"
import type { QueryClient } from "@tanstack/react-query"
import type { WorkspaceViewer } from "@/features/navigation/types"
import type { WorkspaceSettingsInput } from "@/features/settings/query-options"
import type {
  GeneralSettingsPageData,
  LocationSettingsItem,
  LocationSettingsPageData,
} from "@/features/settings/types"
import { navigationQueryKeys } from "@/features/navigation/query-keys"

async function applyCreatedLocation(
  client: QueryClient,
  input: WorkspaceSettingsInput,
  location: LocationSettingsItem
): Promise<void> {
  const predicate = (query: { queryKey: ReadonlyArray<unknown> }) => {
    const scope = query.queryKey.at(-1)
    return (
      matchesSettingsScope(query.queryKey, input) &&
      Boolean(
        scope &&
        typeof scope === "object" &&
        !("locationId" in scope && scope.locationId)
      )
    )
  }
  await client.cancelQueries({ queryKey: ["settings"], predicate })
  client.setQueriesData<LocationSettingsPageData>(
    { queryKey: ["settings", "locations"], predicate },
    (data) =>
      data && {
        ...data,
        locations: [
          ...data.locations.filter((entry) => entry.id !== location.id),
          location,
        ],
      }
  )
  client.setQueriesData<GeneralSettingsPageData>(
    { queryKey: ["settings", "general"], predicate },
    (data) =>
      data && {
        ...data,
        locations: [
          ...data.locations.filter((entry) => entry.id !== location.id),
          { id: location.id, name: location.name, slug: location.slug },
        ],
      }
  )
  void client.invalidateQueries({
    queryKey: ["settings", "rota"],
    predicate,
    refetchType: "none",
  })
  invalidateSettingsRotaDependencies(client, input)
  // Rebuild billing and workspace context on the next navigation, rather than
  // blocking this save on a full session/viewer/router reload.
  for (const [key, viewer] of client.getQueriesData<WorkspaceViewer>({
    queryKey: navigationQueryKeys.viewers,
  })) {
    if (
      viewer?.user.id === input.userId &&
      viewer.activeWorkspace?.id === input.organizationId
    ) {
      void client.invalidateQueries({
        queryKey: key,
        exact: true,
        refetchType: "none",
      })
    }
  }
}

export { applyCreatedLocation }
