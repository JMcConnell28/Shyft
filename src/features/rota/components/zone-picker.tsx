import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function ZonePicker() {
  const { selectedZoneId, setSelectedZoneId, zones } = useRotaWorkspace()

  return (
    <NativeSelect
      className="min-w-28"
      value={selectedZoneId}
      onChange={(event) => setSelectedZoneId(event.target.value)}
    >
      <NativeSelectOption value="all">All zones</NativeSelectOption>
      {zones.map((zone) => (
        <NativeSelectOption key={zone.id} value={zone.id}>
          {zone.name}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

export default ZonePicker
