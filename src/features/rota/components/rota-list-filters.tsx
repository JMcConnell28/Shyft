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
    <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <ListFilterIcon className="size-3.5" />
          Newest weeks first
        </span>
        <span>{totalItems} rotas</span>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(10rem,1fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_8rem]">
        <label className="relative">
          <MapPinIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
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
            className="w-full [&_select]:pl-7"
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
          <CalendarRangeIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <NativeSelect
            value={range}
            onChange={(event) =>
              onRangeChange(event.target.value as RotaRangeFilter)
            }
            className="w-full [&_select]:pl-7"
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
            className="w-full"
          >
            {statusOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        ) : null}

        <label className="relative">
          <Rows3Icon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <NativeSelect
            value={String(pageSize)}
            onChange={(event) =>
              onPageSizeChange(Number(event.target.value) as RotaPageSize)
            }
            className="w-full [&_select]:pl-7"
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
