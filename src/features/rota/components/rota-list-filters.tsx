import { CalendarRangeIcon } from "lucide-react"

import type {
  RotaPageSize,
  RotaRangeFilter,
  RotaStatusFilter,
} from "@/lib/rota-schemas"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"


const statusOptions: Array<{ label: string; value: RotaStatusFilter }> = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
]

const rangeOptions: Array<{ label: string; value: RotaRangeFilter }> = [
  { label: "This week", value: "this-week" },
  { label: "Next 4 weeks", value: "next-4-weeks" },
  { label: "Past 4 weeks", value: "past-4-weeks" },
  { label: "Custom", value: "custom" },
]

function RotaListFilters({
  locationName,
  status,
  range,
  from,
  to,
  pageSize,
  totalItems,
  pageSizeOptions,
  onStatusChange,
  onRangeChange,
  onPageSizeChange,
  onCustomRangeChange,
}: {
  locationName: string | undefined
  status: RotaStatusFilter
  range: RotaRangeFilter
  from?: string
  to?: string
  pageSize: RotaPageSize
  totalItems: number
  pageSizeOptions: ReadonlyArray<RotaPageSize>
  onStatusChange: (status: RotaStatusFilter) => void
  onRangeChange: (range: RotaRangeFilter) => void
  onPageSizeChange: (pageSize: RotaPageSize) => void
  onCustomRangeChange: (value: { from?: string; to?: string }) => void
}) {
  return (
    <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:px-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <CalendarRangeIcon className="size-4 text-muted-foreground" />
          {locationName ?? "Rota workspace"}
        </div>
        <span>{totalItems} weeks</span>
        <span>{pageSize} per page</span>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_10rem_10rem_7rem]">
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

        <NativeSelect
          value={range}
          onChange={(event) => onRangeChange(event.target.value as RotaRangeFilter)}
          className="w-full"
        >
          {rangeOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          value={String(pageSize)}
          onChange={(event) =>
            onPageSizeChange(Number(event.target.value) as RotaPageSize)
          }
          className="w-full"
        >
          {pageSizeOptions.map((size) => (
            <NativeSelectOption key={size} value={String(size)}>
              {size} / page
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <div className="flex items-center rounded-md border border-border/70 bg-muted/15 px-3 text-xs text-muted-foreground">
          {totalItems} total
        </div>
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
