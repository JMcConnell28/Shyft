import type { WorkspaceZone } from "@/features/rota/types/workspace"

function getDefaultRotaZoneId(
  zones: ReadonlyArray<Pick<WorkspaceZone, "id" | "isDeleted">>,
  defaultZoneId: string | null
): string | null {
  const defaultZone = zones.find(
    (zone) => zone.id === defaultZoneId && !zone.isDeleted
  )
  return (
    defaultZone?.id ??
    zones.find((zone) => !zone.isDeleted)?.id ??
    zones.at(0)?.id ??
    null
  )
}

export { getDefaultRotaZoneId }
