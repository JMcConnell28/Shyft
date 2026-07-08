import { CalendarDaysIcon } from "lucide-react"
import type { ReactNode } from "react"

import type { RotaListItem, RotaListPageData } from "@/features/rota/types"
import { MobileRotaCardActions } from "@/features/rota/components/mobile-rota-card-actions"
import { rotaListInteractiveSurfaceClassName } from "@/features/rota/constants/rota-list-styles"
import { cn } from "@/lib/utils"

type MobileRotaCardProps = {
  canEdit: boolean
  data: RotaListPageData
  isCurrent: boolean
  isDeletingDraft: boolean
  isUnpublishing: boolean
  onDeleteDraft: (rotaId: string, weekLabel: string) => void
  onUnpublish: (rotaId: string, weekLabel: string) => void
  row: RotaListItem
}

function MobileRotaCard({
  canEdit,
  data,
  isCurrent,
  isDeletingDraft,
  isUnpublishing,
  onDeleteDraft,
  onUnpublish,
  row,
}: MobileRotaCardProps) {
  return (
    <article
      className={cn(
        rotaListInteractiveSurfaceClassName,
        "animate-in p-4 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none",
        isCurrent && "border-emerald-300"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {isCurrent ? <CurrentRotaBadge /> : null}
            <StatusBadge status={row.status} />
          </div>
          <h2 className="mt-3 truncate text-[17px] leading-tight font-semibold tracking-[-0.02em]">
            {row.weekLabel}
          </h2>
          <RotaMeta icon={CalendarDaysIcon}>{row.locationName}</RotaMeta>
        </div>

        {row.isUnread ? (
          <span className="mt-1 size-2.5 shrink-0 rounded-full bg-blue-600" />
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <MetricPill>{row.shiftCount} shifts</MetricPill>
        <MetricPill>{row.scheduledStaffCount} staff</MetricPill>
        <MetricPill>{row.scheduledHours.toFixed(1)}h</MetricPill>
      </div>

      <RotaAuditLine row={row} />

      <MobileRotaCardActions
        canEdit={canEdit}
        data={data}
        isCurrent={isCurrent}
        isDeletingDraft={isDeletingDraft}
        isUnpublishing={isUnpublishing}
        onDeleteDraft={onDeleteDraft}
        onUnpublish={onUnpublish}
        row={row}
      />
    </article>
  )
}

function CurrentRotaBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      <span className="size-2 rounded-full bg-emerald-600" />
      Current rota
    </div>
  )
}

function StatusBadge({ status }: { status: RotaListItem["status"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
        status === "published"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-blue-50 text-blue-700"
      )}
    >
      {status === "published" ? "Published" : "Draft"}
    </span>
  )
}

function MetricPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[10px] border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
      {children}
    </span>
  )
}

function RotaMeta({
  children,
  compact = false,
  icon: Icon,
}: {
  children: ReactNode
  compact?: boolean
  icon: typeof CalendarDaysIcon
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-xs font-medium text-neutral-500",
        compact ? "mt-0" : "mt-1.5"
      )}
    >
      <Icon className="size-3.5 shrink-0 text-blue-600" />
      <span className="truncate">{children}</span>
    </div>
  )
}

function RotaAuditLine({ row }: { row: RotaListItem }) {
  return (
    <div className="mt-3 truncate text-xs font-medium text-neutral-500">
      {row.status === "published" && row.publishedBy ? (
        <span>Published by {row.publishedBy}</span>
      ) : (
        <span>Created by {row.createdBy}</span>
      )}
      <span aria-hidden="true"> - </span>
      <span>{row.updatedAt}</span>
    </div>
  )
}

export { MobileRotaCard }
