import { ZoneSelect } from "@/features/rota/components/zone-select"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function ZonePicker() {
  const { selectedZoneId, setSelectedZoneId, zones } = useRotaWorkspace()

  return (
    <ZoneSelect
      selectedZoneId={selectedZoneId}
      onSelectZone={setSelectedZoneId}
      zones={zones}
    />
  )
}

export default ZonePicker
