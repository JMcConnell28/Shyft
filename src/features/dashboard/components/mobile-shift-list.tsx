import { Link } from "@tanstack/react-router"
import { CalendarDaysIcon, ChevronRightIcon } from "lucide-react"

import type { DashboardMobileContext } from "@/features/dashboard/components/dashboard-mobile-types"
import type { DashboardShiftSummary } from "@/features/dashboard/types"
import {
  getRotaViewPath,
  getShiftDateParts,
} from "@/features/dashboard/utils/shift-display"
import { cn } from "@/lib/utils"

function WeeklyShiftPanel({
  context,
  shifts,
  weekRangeLabel,
}: {
  context: DashboardMobileContext
  shifts: Array<DashboardShiftSummary>
  weekRangeLabel: string
}) {
  const firstShift = shifts.at(0)

  return (
    <section className="mt-3 animate-in overflow-hidden rounded-[20px] bg-white shadow-[0_5px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7e9f0] duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#f2edff] text-[#795fe5]">
            <CalendarDaysIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
              Shifts this week
            </h2>
            <p className="mt-0.5 text-[11px] font-semibold text-[#8a90a1]">
              {weekRangeLabel}
            </p>
          </div>
        </div>
        {firstShift ? (
          <Link
            to={getRotaViewPath({
              shift: firstShift,
              workspaceSlug: context.workspaceSlug,
              workspaceType: context.workspaceType,
            })}
            className="shrink-0 text-sm font-bold text-[#4265df]"
          >
            View all
          </Link>
        ) : null}
      </div>

      {shifts.length === 0 ? (
        <p className="mx-4 mb-4 rounded-2xl bg-[#f4f6fc] px-4 py-8 text-center text-sm font-medium text-[#747b91]">
          No published shifts are assigned to you this week.
        </p>
      ) : (
        <div className="divide-y divide-[#edf0f5]">
          {shifts.slice(0, 5).map((shift) => (
            <MobileShiftRow
              key={shift.id}
              context={context}
              highlighted={shift.date === getLocalDateValue()}
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
  const date = getShiftDateParts(shift.date)

  return (
    <Link
      to={getRotaViewPath({
        shift,
        workspaceSlug: context.workspaceSlug,
        workspaceType: context.workspaceType,
      })}
      className={cn(
        "grid grid-cols-[3.25rem_0.5rem_minmax(0,1fr)_auto_auto] items-center gap-2.5 px-4 py-3 transition-colors active:bg-[#f5f7fc]",
        highlighted && "bg-[#f6f8ff]"
      )}
    >
      <div className="flex h-12 flex-col items-center justify-center rounded-xl border border-[#e1e4eb] bg-white">
        <span className="text-[10px] font-bold tracking-[0.06em] text-[#7b8195] uppercase">
          {date.day}
        </span>
        <strong className="text-base leading-none font-medium">
          {date.dayNumber}
        </strong>
      </div>

      <span
        className={cn(
          "size-2 rounded-full",
          highlighted ? "bg-[#38ad7e]" : "bg-[#f3ad22]"
        )}
      />

      <div className="min-w-0">
        <p className="truncate text-sm font-bold tracking-tight">
          {shift.zoneName}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium text-[#7b8195]">
          {shift.locationName}
        </p>
      </div>

      <span className="text-xs font-semibold whitespace-nowrap text-[#4c5675]">
        {shift.timeLabel}
      </span>
      <ChevronRightIcon className="size-4 text-[#8f95a5]" />
    </Link>
  )
}

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export { WeeklyShiftPanel }
