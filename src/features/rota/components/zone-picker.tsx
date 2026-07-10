import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { rotaToolbarButtonClassName } from "@/features/rota/constants/rota-toolbar-styles"

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
        className="min-w-24 cursor-pointer focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=open]:ring-0 md:hidden [&_select]:h-7 [&_select]:rounded-lg [&_select]:border-border [&_select]:bg-white [&_select]:px-2 [&_select]:text-sm [&_select]:font-medium [&_select]:text-[#202433] [&_select]:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.12)]"
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
        <SelectTrigger
          className={`${rotaToolbarButtonClassName} hidden min-w-28 cursor-pointer focus:ring-0 focus:outline-none md:flex`}
        >
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
