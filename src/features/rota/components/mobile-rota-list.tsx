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
import { rotaListPrimaryButtonClassName } from "@/features/rota/constants/rota-list-styles"
import { isCurrentRota } from "@/features/rota/utils/mobile-rota-list"
import { isRotaWeekBeforeCurrentWeek } from "@/features/rota/utils/week-utils"

type MobileRotaListProps = {
  data: RotaListPageData
  canCreateRota: boolean
  canEditRotas: boolean
  onDeleteDraft: (rotaId: string, weekLabel: string) => void
  onLocationChange: (locationSlug: string) => void
  onStatusChange: (status: RotaStatusFilter) => void
  onRangeChange: (range: RotaRangeFilter) => void
  onPageSizeChange: (pageSize: RotaPageSize) => void
  onUnpublish: (rotaId: string, weekLabel: string) => void
  isDeletingDraft: (rotaId: string) => boolean
  isUnpublishing: (rotaId: string) => boolean
}

function MobileRotaList({
  data,
  canCreateRota,
  canEditRotas,
  onDeleteDraft,
  onLocationChange,
  onStatusChange,
  onRangeChange,
  onPageSizeChange,
  onUnpublish,
  isDeletingDraft,
  isUnpublishing,
}: MobileRotaListProps) {
  const overviewItems = [
    `${data.pagination.totalItems} total`,
    canEditRotas ? `${data.overview.draftRotas} drafts` : null,
    `${data.overview.publishedRotas} published`,
  ].filter(Boolean) as Array<string>

  return (
    <div className="flex flex-1 flex-col bg-background px-4 pt-2 pb-[max(2rem,env(safe-area-inset-bottom))] text-neutral-950 md:hidden">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <MobileRotaHeader
          locationName={data.selectedLocation?.name ?? null}
          overviewItems={overviewItems}
        />

        <div className="animate-in pb-4 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
          <div className="flex gap-2.5">
            {canCreateRota ? (
              <NewRotaDialog
                locations={data.locations}
                selectedLocation={data.selectedLocation}
                triggerLabel="New rota"
                triggerClassName={`${rotaListPrimaryButtonClassName} h-11 shrink-0 px-4 text-sm`}
                triggerIcon="plus"
                disabled={!canCreateRota}
                defaultSourceType="blank"
                workspaceType={data.workspaceType}
              />
            ) : null}

            <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
              <MobileRotaFilters
                canEditRotas={canEditRotas}
                data={data}
                onLocationChange={onLocationChange}
                onPageSizeChange={onPageSizeChange}
                onRangeChange={onRangeChange}
                onStatusChange={onStatusChange}
              />
            </div>
          </div>

          {data.overview.unreadPublishedRotas > 0 ? (
            <div className="mt-3 rounded-[10px] border border-blue-100 bg-blue-50 px-3.5 py-2.5 text-xs font-medium text-blue-700">
              {data.overview.unreadPublishedRotas} unread published{" "}
              {data.overview.unreadPublishedRotas === 1 ? "rota" : "rotas"}
            </div>
          ) : null}
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
                isCurrent={isCurrentRota(row)}
                isDeletingDraft={isDeletingDraft(row.id)}
                isUnpublishing={isUnpublishing(row.id)}
                onDeleteDraft={onDeleteDraft}
                onUnpublish={onUnpublish}
                row={row}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MobileRotaHeader({
  locationName,
  overviewItems,
}: {
  locationName: string | null
  overviewItems: Array<string>
}) {
  return (
    <section className="animate-in pb-4 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <h1 className="text-[2rem] leading-none font-semibold tracking-[-0.02em]">
        Rotas
      </h1>
      <p className="mt-2 truncate text-sm font-medium text-neutral-500">
        {locationName ?? "Choose a location"}
      </p>

      {overviewItems.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {overviewItems.map((item) => (
            <span
              key={item}
              className="rounded-[10px] border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 shadow-xs shadow-neutral-200"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
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
