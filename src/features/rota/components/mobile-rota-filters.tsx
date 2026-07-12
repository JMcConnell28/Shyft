import { ArrowUpDownIcon, ListFilterIcon } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

import type {
  RotaPageSize,
  RotaRangeFilter,
  RotaStatusFilter,
} from "@/features/rota/schemas/rota-schemas"
import type { RotaListPageData } from "@/features/rota/types"
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { rotaPageSizeValues } from "@/lib/rota-schemas"

type MobileRotaFiltersProps = {
  canEditRotas: boolean
  data: RotaListPageData
  onLocationChange: (locationSlug: string) => void
  onPageSizeChange: (pageSize: RotaPageSize) => void
  onStatusChange: (status: RotaStatusFilter) => void
  onRangeChange: (range: RotaRangeFilter) => void
}

const statusOptions: Array<{ label: string; value: RotaStatusFilter }> = [
  { label: "All rotas", value: "all" },
  { label: "Draft rotas", value: "draft" },
  { label: "Published rotas", value: "published" },
]

const rangeOptions: Array<{ label: string; value: RotaRangeFilter }> = [
  { label: "All weeks", value: "all" },
  { label: "This week", value: "this-week" },
  { label: "Next 4 weeks", value: "next-4-weeks" },
  { label: "Past 4 weeks", value: "past-4-weeks" },
]

function MobileRotaFilters({
  canEditRotas,
  data,
  onLocationChange,
  onPageSizeChange,
  onStatusChange,
  onRangeChange,
}: MobileRotaFiltersProps) {
  return (
    <div className="flex items-center gap-2.5">
      {canEditRotas ? (
        <MobileFilterSelect
          icon={ListFilterIcon}
          label="Filter"
          onChange={(value) => {
            const [kind, nextValue] = value.split(":")

            if (kind === "status") {
              onStatusChange(nextValue as RotaStatusFilter)
              return
            }

            if (kind === "location") {
              onLocationChange(nextValue)
            }
          }}
        >
          <NativeSelectOptGroup label="Status">
            {statusOptions.map((option) => (
              <NativeSelectOption
                key={option.value}
                value={`status:${option.value}`}
              >
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelectOptGroup>
          {data.locations.length > 1 ? (
            <NativeSelectOptGroup label="Location">
              {data.locations.map((location) => (
                <NativeSelectOption
                  key={location.id}
                  value={`location:${location.slug}`}
                >
                  {location.name}
                </NativeSelectOption>
              ))}
            </NativeSelectOptGroup>
          ) : null}
        </MobileFilterSelect>
      ) : null}

      <MobileFilterSelect
        icon={ArrowUpDownIcon}
        label="Sort"
        onChange={(value) => {
          const [kind, nextValue] = value.split(":")

          if (kind === "range") {
            onRangeChange(nextValue as RotaRangeFilter)
            return
          }

          if (kind === "page") {
            onPageSizeChange(Number(nextValue) as RotaPageSize)
          }
        }}
      >
        <NativeSelectOptGroup label="Week range">
          {rangeOptions.map((option) => (
            <NativeSelectOption
              key={option.value}
              value={`range:${option.value}`}
            >
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Rows per page">
          {rotaPageSizeValues.map((size) => (
            <NativeSelectOption key={size} value={`page:${size}`}>
              {size} rotas
            </NativeSelectOption>
          ))}
        </NativeSelectOptGroup>
      </MobileFilterSelect>
    </div>
  )
}

function MobileFilterSelect({
  children,
  icon: Icon,
  label,
  onChange,
}: {
  children: ReactNode
  icon: ComponentType<{ className?: string }>
  label: string
  onChange: (value: string) => void
}) {
  return (
    <label className="relative flex h-10 min-w-[6.5rem] items-center justify-center gap-2 rounded-[10px] border border-[#d7e0ed] bg-white px-3 text-[13px] font-semibold text-[#405782] shadow-[0_2px_8px_rgba(30,50,96,0.025)]">
      <Icon className="size-[18px]" aria-hidden="true" />
      <span>{label}</span>
      <NativeSelect
        value=""
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="absolute inset-0 opacity-0 [&_select]:h-full [&_select]:w-full [&_select]:cursor-pointer"
      >
        <NativeSelectOption value="" disabled>
          {label}
        </NativeSelectOption>
        {children}
      </NativeSelect>
    </label>
  )
}

export { MobileRotaFilters }
