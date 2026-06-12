import { Link } from "@tanstack/react-router"
import { ChevronRightIcon } from "lucide-react"

import type { DashboardMobileContext } from "@/features/dashboard/components/dashboard-mobile-types"
import type { DashboardShiftSummary } from "@/features/dashboard/types"
import {
  formatShiftCount,
  getRotaViewPath,
} from "@/features/dashboard/utils/shift-display"
import { cn } from "@/lib/utils"

function WeeklyShiftPanel({
  context,
  shifts,
  weekRangeLabel,
}: {
  context: DashboardMobileContext
  shifts: DashboardShiftSummary[]
  weekRangeLabel: string
}) {
  return (
    <section className="mt-5 overflow-hidden rounded-[22px] border border-[#dbe3ff] bg-white shadow-[0_14px_34px_rgba(27,42,89,0.08)]">
      <div className="flex items-end justify-between gap-3 px-5 py-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Shifts this week</h2>
          <p className="mt-1 text-sm font-semibold text-[#687087]">
            {formatShiftCount(shifts.length)} · {weekRangeLabel}
          </p>
        </div>
        <span className="text-sm font-bold text-[#075cff]">View all</span>
      </div>

      {shifts.length === 0 ? (
        <p className="mx-5 mb-5 rounded-2xl bg-[#f4f7ff] px-4 py-8 text-center text-sm font-medium text-[#747b91]">
          No published shifts are assigned to you this week.
        </p>
      ) : (
        <div className="divide-y divide-[#e7ecf8]">
          {shifts.slice(0, 5).map((shift, index) => (
            <MobileShiftRow
              key={shift.id}
              context={context}
              highlighted={index === 0}
              shift={shift}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function MobileShiftRow({
  context,
  highlighted,
  shift,
}: {
  context: DashboardMobileContext
  highlighted: boolean
  shift: DashboardShiftSummary
}) {
  return (
    <Link
      to={getRotaViewPath({
        shift,
        workspaceSlug: context.workspaceSlug,
        workspaceType: context.workspaceType,
      })}
      className={cn(
        "grid grid-cols-[4.5rem_0.75rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 transition-colors active:bg-[#eef4ff]",
        highlighted && "bg-[#f3f7ff]",
      )}
    >
      <div>
        <p
          className={cn(
            "text-base font-bold",
            highlighted ? "text-[#075cff]" : "text-[#080d23]",
          )}
        >
          {shift.dayLabel}
        </p>
        <p className="mt-1 text-sm font-semibold text-[#687087]">
          {shift.dateLabel}
        </p>
      </div>

      <span
        className={cn(
          "size-2.5 rounded-full",
          highlighted ? "bg-[#075cff]" : "bg-[#8f96aa]",
        )}
      />

      <div className="min-w-0">
        <p className="truncate text-base font-bold tracking-tight">
          {shift.timeLabel}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-[#687087]">
          {shift.locationName}
        </p>
        <p className="truncate text-sm font-medium text-[#687087]">
          {shift.zoneName}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-[#eef4ff] px-2.5 py-1 text-xs font-bold text-[#075cff]">
          Upcoming
        </span>
        <ChevronRightIcon className="size-5 text-[#687087]" />
      </div>
    </Link>
  )
}

export { WeeklyShiftPanel }
