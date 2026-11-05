import type { QueryClient, QueryKey } from "@tanstack/react-query"
import type { WorkspaceSettingsInput } from "@/features/settings/query-options"

function matchesSettingsScope(
  key: QueryKey,
  input: WorkspaceSettingsInput
): boolean {
  const scope = key.at(-1)
  if (
    !scope ||
    typeof scope !== "object" ||
    !("userId" in scope) ||
    scope.userId !== input.userId
  )
    return false
  return input.organizationId
    ? "organizationId" in scope && scope.organizationId === input.organizationId
    : "locationId" in scope && scope.locationId === input.locationId
}

function invalidateSettingsRotaDependencies(
  client: QueryClient,
  input: WorkspaceSettingsInput,
  locationIds: Array<string> = []
): void {
  void client.invalidateQueries({
    queryKey: ["rota"],
    predicate: (query) => {
      if (query.queryKey[1] === "unread-updates") return false
      const scope = query.queryKey.at(-1)
      if (query.queryKey[1] === "creation-preview") {
        return Boolean(
          scope &&
          typeof scope === "object" &&
          "locationId" in scope &&
          typeof scope.locationId === "string" &&
          locationIds.includes(scope.locationId)
        )
      }
      return matchesSettingsScope(query.queryKey, input)
    },
    refetchType: "none",
  })
}

export { matchesSettingsScope, invalidateSettingsRotaDependencies }
