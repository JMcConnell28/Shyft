import { ChevronDownIcon, SlidersHorizontalIcon } from "lucide-react"
import type { ReactNode } from "react"

import type {
  RotaPageSize,
  RotaRangeFilter,
  RotaStatusFilter,
} from "@/features/rota/schemas/rota-schemas"
import type { RotaListPageData } from "@/features/rota/types"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { rotaPageSizeValues } from "@/lib/rota-schemas"
import { cn } from "@/lib/utils"

type MobileRotaFiltersProps = {
  canEditRotas: boolean
  data: RotaListPageData
  onLocationChange: (locationSlug: string) => void
  onStatusChange: (status: RotaStatusFilter) => void
  onRangeChange: (range: RotaRangeFilter) => void
  onPageSizeChange: (pageSize: RotaPageSize) => void
}

const statusOptions: Array<{ label: string; value: RotaStatusFilter }> = [
  { label: "Status", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
]

const rangeOptions: Array<{ label: string; value: RotaRangeFilter }> = [
  { label: "Week", value: "all" },
  { label: "This week", value: "this-week" },
  { label: "Next 4 weeks", value: "next-4-weeks" },
  { label: "Past 4 weeks", value: "past-4-weeks" },
]

function MobileRotaFilters({
  canEditRotas,
  data,
  onLocationChange,
  onStatusChange,
  onRangeChange,
  onPageSizeChange,
}: MobileRotaFiltersProps) {
  return (
    <>
      {canEditRotas ? (
        <MobileFilterSelect
          label="Status"
          value={data.filters.status}
          onChange={(value) => onStatusChange(value as RotaStatusFilter)}
        >
          {statusOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </MobileFilterSelect>
      ) : null}

      <MobileFilterSelect
        label="Location"
        value={data.selectedLocation?.id ?? ""}
        disabled={data.locations.length === 0}
        onChange={(value) => {
          const location = data.locations.find((entry) => entry.id === value)

          if (location) {
            onLocationChange(location.slug)
          }
        }}
      >
        {data.locations.map((location) => (
          <NativeSelectOption key={location.id} value={location.id}>
            {location.name}
          </NativeSelectOption>
        ))}
      </MobileFilterSelect>

      <MobileFilterSelect
        label="Week"
        value={data.filters.range === "custom" ? "all" : data.filters.range}
        onChange={(value) => onRangeChange(value as RotaRangeFilter)}
      >
        {rangeOptions.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </MobileFilterSelect>

      <MobileFilterSelect
        label="Page size"
        value={String(data.filters.pageSize)}
        iconOnly
        onChange={(value) => onPageSizeChange(Number(value) as RotaPageSize)}
      >
        {rotaPageSizeValues.map((size) => (
          <NativeSelectOption key={size} value={String(size)}>
            {size} / page
          </NativeSelectOption>
        ))}
      </MobileFilterSelect>
    </>
  )
}

function MobileFilterSelect({
  children,
  disabled = false,
  iconOnly = false,
  label,
  value,
  onChange,
}: {
  children: ReactNode
  disabled?: boolean
  iconOnly?: boolean
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <NativeSelect
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "[&_select]:h-11 [&_select]:rounded-[10px] [&_select]:border-neutral-200 [&_select]:bg-white [&_select]:text-sm [&_select]:font-semibold [&_select]:text-neutral-900 [&_select]:shadow-xs [&_select]:shadow-neutral-200 [&_select]:focus-visible:border-neutral-300 [&_select]:focus-visible:ring-neutral-200",
          "[&_[data-slot=native-select-icon]]:hidden",
          iconOnly
            ? "w-11 [&_select]:px-0 [&_select]:text-transparent"
            : "min-w-28 [&_select]:pr-9 [&_select]:pl-3.5"
        )}
      >
        {children}
      </NativeSelect>
      {iconOnly ? (
        <SlidersHorizontalIcon className="pointer-events-none absolute top-1/2 left-1/2 size-4.5 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
      ) : (
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-neutral-500" />
      )}
    </label>
  )
}

export { MobileRotaFilters }
