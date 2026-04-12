import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function LocationPicker() {
  const { locations, selectedLocationId, setSelectedLocationId } = useRotaWorkspace()

  return (
    <NativeSelect
      className="w-full"
      disabled={locations.length <= 1}
      value={selectedLocationId}
      onChange={(event) => setSelectedLocationId(event.target.value)}
    >
      {locations.map((location) => (
        <NativeSelectOption key={location.id} value={location.id}>
          {location.name}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

export default LocationPicker
