import { CalendarRangeIcon, MapPinIcon } from "lucide-react"

import type {
  RotaPageSize,
  RotaRangeFilter,
  RotaStatusFilter,
} from "@/features/rota/schemas/rota-schemas"
import type { RotaListPageData } from "@/features/rota/types"
import { NewRotaDialog } from "@/components/app/new-rota-dialog"
import { MobileRotaCard } from "@/features/rota/components/mobile-rota-card"
import { MobileRotaFilters } from "@/features/rota/components/mobile-rota-filters"
import { isRotaWeekBeforeCurrentWeek } from "@/features/rota/utils/week-utils"

type MobileRotaListProps = {
  data: RotaListPageData
  canCreateRota: boolean
  canEditRotas: boolean
  onLocationChange: (locationSlug: string) => void
  onStatusChange: (status: RotaStatusFilter) => void
  onRangeChange: (range: RotaRangeFilter) => void
  onPageSizeChange: (pageSize: RotaPageSize) => void
}

function MobileRotaList({
  data,
  canCreateRota,
  canEditRotas,
  onLocationChange,
  onPageSizeChange,
  onStatusChange,
  onRangeChange,
}: MobileRotaListProps) {
  return (
    <div className="flex flex-1 flex-col bg-white px-[18px] pt-5 pb-[max(2rem,env(safe-area-inset-bottom))] text-[#10285c] md:hidden">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
        <MobileRotaHeader />

        <div className="animate-in pb-6 duration-300 fade-in motion-reduce:animate-none">
          <div className="flex items-center justify-between gap-3">
            <MobileRotaFilters
              canEditRotas={canEditRotas}
              data={data}
              onLocationChange={onLocationChange}
              onPageSizeChange={onPageSizeChange}
              onRangeChange={onRangeChange}
              onStatusChange={onStatusChange}
            />

            {canCreateRota ? (
              <NewRotaDialog
                locations={data.locations}
                selectedLocation={data.selectedLocation}
                triggerLabel="New rota"
                triggerClassName="h-10 shrink-0 gap-2 rounded-[10px] border-0 bg-[#0868f7] px-3.5 text-[13px] font-semibold text-white shadow-[0_7px_16px_rgba(8,104,247,0.18)] hover:bg-[#005de2]"
                triggerIcon="plus"
                disabled={!canCreateRota}
                defaultSourceType="blank"
                workspaceType={data.workspaceType}
              />
            ) : null}
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.055em] text-[#526991] uppercase">
          <span>All rotas</span>
          <span className="flex size-7 items-center justify-center rounded-full bg-[#f0f3f9] text-xs text-[#526991]">
            {data.pagination.totalItems}
          </span>
        </div>

        {!data.selectedLocation ? (
          <MobileEmptyState
            icon={MapPinIcon}
            message="You do not currently have access to any locations with rota visibility."
            title="No rota access yet"
          />
        ) : data.rows.length === 0 ? (
          <MobileEmptyState
            icon={CalendarRangeIcon}
            message="Adjust the filters or create a new rota for this location."
            title="No rotas found"
          />
        ) : (
          <div className="space-y-2.5">
            {data.rows.map((row) => (
              <MobileRotaCard
                key={row.id}
                canEdit={
                  canEditRotas && !isRotaWeekBeforeCurrentWeek(row.weekStart)
                }
                data={data}
                row={row}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MobileRotaHeader() {
  return (
    <section className="animate-in pb-6 duration-300 fade-in motion-reduce:animate-none">
      <h1 className="text-[26px] leading-none font-bold tracking-[-0.035em]">
        Rota list
      </h1>
      <p className="mt-2.5 text-sm font-medium text-[#526991]">
        View, edit and manage your rotas.
      </p>
    </section>
  )
}

function MobileEmptyState({
  icon: Icon,
  message,
  title,
}: {
  icon: typeof CalendarRangeIcon
  message: string
  title: string
}) {
  return (
    <div className="rounded-[10px] border border-dashed border-neutral-300 bg-white px-5 py-10 text-center shadow-xs shadow-neutral-200">
      <span className="mx-auto flex size-11 items-center justify-center rounded-[10px] border border-blue-100 bg-blue-50 text-blue-600">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold tracking-[-0.01em] text-neutral-950">
        {title}
      </h2>
      <p className="mx-auto mt-1.5 max-w-64 text-sm font-medium text-neutral-500">
        {message}
      </p>
    </div>
  )
}

export { MobileRotaList }
