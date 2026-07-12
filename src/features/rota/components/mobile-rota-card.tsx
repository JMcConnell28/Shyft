import { CalendarDaysIcon } from "lucide-react"

import type { RotaListItem, RotaListPageData } from "@/features/rota/types"
import { MobileRotaCardActions } from "@/features/rota/components/mobile-rota-card-actions"
import { formatMobileRotaUpdatedLabel } from "@/features/rota/utils/mobile-rota-list"
import { cn } from "@/lib/utils"

type MobileRotaCardProps = {
  canEdit: boolean
  data: RotaListPageData
  row: RotaListItem
}

function MobileRotaCard({ canEdit, data, row }: MobileRotaCardProps) {
  return (
    <article className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 rounded-[11px] border border-[#e0e7f1] bg-white p-3 text-[#10285c] shadow-[0_3px_10px_rgba(30,50,96,0.065)]">
      <span className="flex size-11 items-center justify-center rounded-xl bg-[#edf3ff] text-[#0868f7]">
        <CalendarDaysIcon className="size-5" strokeWidth={2.2} />
      </span>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2 pr-6">
          <h2 className="min-w-0 text-[16px] leading-6 font-semibold tracking-[-0.02em]">
            {row.weekLabel}
          </h2>
          <StatusBadge status={row.status} />
        </div>

        <p className="mt-0.5 text-xs font-medium text-[#526991]">
          {row.status === "published" ? (
            <>
              Published{row.publishedBy ? " by " : null}
              {row.publishedBy ? (
                <span className="font-semibold text-[#0868f7]">
                  {row.publishedBy}
                </span>
              ) : null}
            </>
          ) : (
            "Draft"
          )}
        </p>

        <div className="mt-2 flex items-end justify-between gap-2">
          <p className="min-w-0 truncate pb-0.5 text-[11px] font-medium text-[#607399]">
            {formatMobileRotaUpdatedLabel(row)}
            <span className="px-1.5" aria-hidden="true">
              •
            </span>
            {Math.round(row.scheduledHours)} hours
          </p>
          <MobileRotaCardActions canEdit={canEdit} data={data} row={row} />
        </div>
      </div>
    </article>
  )
}

function StatusBadge({ status }: { status: RotaListItem["status"] }) {
  return (
    <span
      className={cn(
        "mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] leading-4 font-semibold",
        status === "published"
          ? "bg-[#e9f8ee] text-[#20984d]"
          : "bg-[#fff3d9] text-[#c77b00]"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "published" ? "bg-[#39c76b]" : "bg-[#f2a900]"
        )}
      />
      {status === "published" ? "Published" : "Draft"}
    </span>
  )
}

export { MobileRotaCard }
