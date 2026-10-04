import type { WorkspaceZone } from "@/features/rota/types/workspace"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { rotaToolbarButtonClassName } from "@/features/rota/constants/rota-toolbar-styles"

function ZoneSelect({
  selectedZoneId,
  onSelectZone,
  zones,
}: {
  selectedZoneId: string | null
  onSelectZone: (zoneId: string) => void
  zones: Array<WorkspaceZone>
}) {
  const options = zones.map((zone) => ({ label: zone.name, value: zone.id }))
  const selectedLabel =
    options.find((option) => option.value === selectedZoneId)?.label ??
    "No zones available"

  return (
    <>
      <NativeSelect
        className="min-w-24 cursor-pointer focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=open]:ring-0 md:hidden [&_select]:h-7 [&_select]:rounded-lg [&_select]:border-border [&_select]:bg-white [&_select]:px-2 [&_select]:text-sm [&_select]:font-medium [&_select]:text-[#202433] [&_select]:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(0,0,0,0.12)]"
        aria-label="Zone"
        disabled={zones.length === 0}
        value={selectedZoneId ?? ""}
        onChange={(event) => onSelectZone(event.target.value)}
      >
        {options.length === 0 ? (
          <NativeSelectOption value="">No zones available</NativeSelectOption>
        ) : null}
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      <Select
        value={selectedZoneId}
        disabled={zones.length === 0}
        onValueChange={(value) => {
          if (typeof value === "string") onSelectZone(value)
        }}
      >
        <SelectTrigger
          aria-label="Zone"
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

export { ZoneSelect }
