import * as React from "react"
import type { WorkspaceZone } from "@/features/rota/types/workspace"
import { getDefaultRotaZoneId } from "@/features/rota/utils/default-rota-zone"

function useRotaZoneSelection({
  rotaId,
  defaultZoneId,
  zones,
}: {
  rotaId: string
  defaultZoneId: string | null
  zones: Array<WorkspaceZone>
}) {
  const initialZoneId = getDefaultRotaZoneId(zones, defaultZoneId)
  const [selection, setSelection] = React.useState({
    rotaId,
    initialZoneId,
    zoneId: initialZoneId,
  })

  const selectedZoneId =
    selection.rotaId === rotaId &&
    selection.initialZoneId === initialZoneId &&
    zones.some((zone) => zone.id === selection.zoneId)
      ? selection.zoneId
      : initialZoneId

  React.useEffect(() => {
    setSelection((current) =>
      current.rotaId === rotaId &&
      current.initialZoneId === initialZoneId &&
      current.zoneId === selectedZoneId
        ? current
        : { rotaId, initialZoneId, zoneId: selectedZoneId }
    )
  }, [rotaId, initialZoneId, selectedZoneId])

  function setSelectedZoneId(zoneId: string): void {
    if (!zones.some((zone) => zone.id === zoneId)) return
    setSelection({ rotaId, initialZoneId, zoneId })
  }

  return { selectedZoneId, setSelectedZoneId }
}

export { useRotaZoneSelection }
