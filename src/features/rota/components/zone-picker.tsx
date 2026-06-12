import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function ZonePicker() {
  const { selectedZoneId, setSelectedZoneId, zones } = useRotaWorkspace()
  const options = [
    {
      label: "All zones",
      value: "all",
    },
    ...zones.map((zone) => ({
      label: zone.name,
      value: zone.id,
    })),
  ]
  const selectedLabel =
    options.find((option) => option.value === selectedZoneId)?.label ??
    "All zones"

  return (
    <>
      <NativeSelect
        className="min-w-28 cursor-pointer md:hidden"
        value={selectedZoneId}
        onChange={(event) => setSelectedZoneId(event.target.value)}
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      <Select
        value={selectedZoneId}
        onValueChange={(value) => {
          if (typeof value === "string") {
            setSelectedZoneId(value)
          }
        }}
      >
        <SelectTrigger className="hidden min-w-28 cursor-pointer bg-card shadow md:flex">
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent align="start">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

export default ZonePicker
