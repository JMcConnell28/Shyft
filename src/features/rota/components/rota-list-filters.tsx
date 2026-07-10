import {
  CalendarRangeIcon,
  ListFilterIcon,
  MapPinIcon,
  Rows3Icon,
} from "lucide-react"

import type {
  RotaPageSize,
  RotaRangeFilter,
  RotaStatusFilter,
} from "@/lib/rota-schemas"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  rotaListInputClassName,
  rotaListSelectClassName,
} from "@/features/rota/constants/rota-list-styles"

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
  totalItems,
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
  totalItems: number
  showStatusFilter?: boolean
  pageSizeOptions: ReadonlyArray<RotaPageSize>
  onLocationChange: (locationSlug: string) => void
  onStatusChange: (status: RotaStatusFilter) => void
  onRangeChange: (range: RotaRangeFilter) => void
  onPageSizeChange: (pageSize: RotaPageSize) => void
  onCustomRangeChange: (value: { from?: string; to?: string }) => void
}) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-neutral-500">
        <span className="inline-flex items-center gap-2 font-medium text-neutral-700">
          <ListFilterIcon className="size-3.5 text-blue-600" />
          Newest weeks first
        </span>
        <span className="rounded-[10px] border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
          {totalItems} rotas
        </span>
      </div>

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
            value={range}
            onChange={(event) =>
              onRangeChange(event.target.value as RotaRangeFilter)
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

      {range === "custom" ? (
        <div className="grid gap-2 md:grid-cols-2 xl:max-w-md">
          <Input
            type="date"
            className={rotaListInputClassName}
            value={from ?? ""}
            onChange={(event) =>
              onCustomRangeChange({
                from: event.target.value || undefined,
                to,
              })
            }
          />
          <Input
            type="date"
            className={rotaListInputClassName}
            value={to ?? ""}
            onChange={(event) =>
              onCustomRangeChange({
                from,
                to: event.target.value || undefined,
              })
            }
          />
        </div>
      ) : null}
    </div>
  )
}

export { RotaListFilters }
