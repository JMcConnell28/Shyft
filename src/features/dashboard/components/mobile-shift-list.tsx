import { Link } from "@tanstack/react-router"
import { ChevronRightIcon, Clock3Icon, UserRoundIcon } from "lucide-react"

import type { DashboardMobileContext } from "@/features/dashboard/components/dashboard-mobile-types"
import type { DashboardShiftSummary } from "@/features/dashboard/types"
import {
  getRotaViewPath,
  getShiftDateParts,
} from "@/features/dashboard/utils/shift-display"

type WeeklyShiftPanelProps = {
  context: DashboardMobileContext
  shifts: Array<DashboardShiftSummary>
  weekHoursLabel: string | null
}

function WeeklyShiftPanel({
  context,
  shifts,
  weekHoursLabel,
}: WeeklyShiftPanelProps) {
  const firstShift = shifts.at(0)

  return (
    <section className="mt-5 animate-in duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg leading-tight font-extrabold tracking-[-0.025em] text-[#0b1836]">
          Shifts this week
        </h2>
        {weekHoursLabel ? (
          <span className="text-base font-extrabold tracking-[-0.02em] text-[#0865f5]">
            {weekHoursLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-2.5 overflow-hidden rounded-xl bg-white shadow-[0_2px_9px_rgba(25,45,85,0.07)] ring-1 ring-[#e0e5ed]">
        {shifts.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm font-medium text-[#66738d]">
            No shifts are assigned to you this week.
          </p>
        ) : (
          <>
            <div className="divide-y divide-[#e6e9ef]">
              {shifts.slice(0, 5).map((shift) => (
                <MobileShiftRow
                  key={shift.id}
                  context={context}
                  shift={shift}
                />
              ))}
            </div>
            {firstShift ? (
              <Link
                to={getRotaViewPath({
                  shift: firstShift,
                  workspaceSlug: context.workspaceSlug,
                  workspaceType: context.workspaceType,
                })}
                className="flex items-center justify-center gap-1.5 border-t border-[#e6e9ef] px-4 py-3 text-sm font-extrabold tracking-[-0.015em] text-[#0865f5] transition-colors active:bg-[#f7f9ff]"
              >
                View full rota
                <ChevronRightIcon className="size-4" strokeWidth={2.5} />
              </Link>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

function MobileShiftRow({
  context,
  shift,
}: {
  context: DashboardMobileContext
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
      className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 transition-colors active:bg-[#f7f9ff]"
    >
      <div>
        <p className="text-[0.9375rem] leading-tight font-extrabold tracking-[-0.02em] text-[#102044]">
          {date.day}
        </p>
        <p className="mt-0.5 text-xs font-medium text-[#53617d]">
          {date.dayNumber} {date.month}
        </p>
      </div>

      <div className="grid min-w-0 gap-1 text-sm font-medium text-[#53617d]">
        <ShiftMeta icon={Clock3Icon} label={shift.timeLabel} />
        <ShiftMeta icon={UserRoundIcon} label={shift.zoneName} />
      </div>

      <ChevronRightIcon className="size-4 text-[#71809a]" />
    </Link>
  )
}

function ShiftMeta({
  icon: Icon,
  label,
}: {
  icon: typeof Clock3Icon
  label: string
}) {
  return (
    <p className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-[#0865f5]" />
      <span className="truncate">{label}</span>
    </p>
  )
}

export { WeeklyShiftPanel }
