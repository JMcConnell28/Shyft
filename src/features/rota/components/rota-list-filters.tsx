import { CalendarRangeIcon, MapPinIcon, Rows3Icon } from "lucide-react"

import type {
  RotaPageSize,
  RotaRangeFilter,
  RotaStatusFilter,
} from "@/lib/rota-schemas"
import { RotaListCustomDateRange } from "@/features/rota/components/rota-list-custom-date-range"
import { useRotaDateFilters } from "@/features/rota/hooks/use-rota-date-filters"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { rotaListSelectClassName } from "@/features/rota/constants/rota-list-styles"

type RotaListFilterLocation = {
  id: string
  name: string
  slug: string
}

const statusOptions: Array<{ label: string; value: RotaStatusFilter }> = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
]

const rangeOptions: Array<{ label: string; value: RotaRangeFilter }> = [
  { label: "All rotas", value: "all" },
  { label: "This week", value: "this-week" },
  { label: "Next 4 weeks", value: "next-4-weeks" },
  { label: "Past 4 weeks", value: "past-4-weeks" },
  { label: "Custom", value: "custom" },
]

function RotaListFilters({
  locations,
  selectedLocationId,
  status,
  range,
  from,
  to,
  pageSize,
  showStatusFilter = true,
  pageSizeOptions,
  onLocationChange,
  onStatusChange,
  onRangeChange,
  onPageSizeChange,
  onCustomRangeChange,
}: {
  locations: Array<RotaListFilterLocation>
  selectedLocationId: string | undefined
  status: RotaStatusFilter
  range: RotaRangeFilter
  from?: string
  to?: string
  pageSize: RotaPageSize
  showStatusFilter?: boolean
  pageSizeOptions: ReadonlyArray<RotaPageSize>
  onLocationChange: (locationSlug: string) => void
  onStatusChange: (status: RotaStatusFilter) => void
  onRangeChange: (range: RotaRangeFilter) => void
  onPageSizeChange: (pageSize: RotaPageSize) => void
  onCustomRangeChange: (value: { from?: string; to?: string }) => void
}) {
  const dateFilters = useRotaDateFilters({
    range,
    from,
    to,
    scopeKey: selectedLocationId ?? "",
    onRangeChange,
    onCustomRangeChange,
  })
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_8rem]">
        <label className="relative">
          <MapPinIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-3.5 -translate-y-1/2 text-blue-600" />
          <NativeSelect
            value={selectedLocationId ?? ""}
            onChange={(event) => {
              const location = locations.find(
                (entry) => entry.id === event.target.value
              )

              if (location) {
                onLocationChange(location.slug)
              }
            }}
            className={`${rotaListSelectClassName} [&_select]:pl-8`}
            disabled={locations.length === 0}
          >
            {locations.length === 0 ? (
              <NativeSelectOption value="">No locations</NativeSelectOption>
            ) : null}
            {locations.map((location) => (
              <NativeSelectOption key={location.id} value={location.id}>
                {location.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>

        <label className="relative">
          <CalendarRangeIcon className="pointer-events-none absolute top-1/2 left-3 z-10 size-3.5 -translate-y-1/2 text-blue-600" />
          <NativeSelect
            aria-label="Rota date range"
            value={dateFilters.selected.range}
            onChange={(event) =>
              dateFilters.changeRange(event.target.value as RotaRangeFilter)
            }
            className={`${rotaListSelectClassName} [&_select]:pl-8`}
          >
            {rangeOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>

        {showStatusFilter ? (
          <NativeSelect
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as RotaStatusFilter)
            }
            className={rotaListSelectClassName}
          >
            {statusOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        ) : null}

        <label className="relative">
          <Rows3Icon className="pointer-events-none absolute top-1/2 left-3 z-10 size-3.5 -translate-y-1/2 text-blue-600" />
          <NativeSelect
            value={String(pageSize)}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value) as RotaPageSize)
            }
            className={`${rotaListSelectClassName} [&_select]:pl-8`}
          >
            {pageSizeOptions.map((size) => (
              <NativeSelectOption key={size} value={String(size)}>
                {size} / page
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
      </div>

      {dateFilters.selected.range === "custom" ? (
        <RotaListCustomDateRange
          from={dateFilters.selected.from}
          to={dateFilters.selected.to}
          isPending={dateFilters.isPending}
          onFromChange={dateFilters.changeFrom}
          onToChange={dateFilters.changeTo}
        />
      ) : null}
    </div>
  )
}

export { RotaListFilters }
