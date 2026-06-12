import { Link } from "@tanstack/react-router"
import {
  BellIcon,
  CalendarIcon,
  ChevronRightIcon,
  MapPinIcon,
  RocketIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react"

import type { DashboardMobileContext } from "@/features/dashboard/components/dashboard-mobile-types"
import { DashboardClockStatusPanel } from "@/features/dashboard/components/dashboard-clock-status-panel"
import { WeeklyShiftPanel } from "@/features/dashboard/components/mobile-shift-list"
import type {
  DashboardClockStatus,
  DashboardShiftSummary,
} from "@/features/dashboard/types"
import {
  formatShiftCount,
  getDashboardGreeting,
  getRotaViewPath,
  getUserInitials,
} from "@/features/dashboard/utils/shift-display"

type MobileDashboardShellProps = {
  clockStatus: DashboardClockStatus
  context: DashboardMobileContext
  nextShift: DashboardShiftSummary | null
  shifts: DashboardShiftSummary[]
  weekRangeLabel: string
}

function MobileDashboardShell({
  clockStatus,
  context,
  nextShift,
  shifts,
  weekRangeLabel,
}: MobileDashboardShellProps) {
  const shiftCountLabel = formatShiftCount(shifts.length)

  return (
    <div className="min-h-full bg-[#f7f9ff] text-[#080d23] md:hidden">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pt-5 pb-8">
        <MobileDashboardHeader context={context} />

        <MobileDashboardHero
          shiftCountLabel={shiftCountLabel}
          userName={context.userName}
        />

        <DashboardClockStatusPanel
          clockStatus={clockStatus}
          variant="mobile"
        />
        <NextShiftPanel context={context} shift={nextShift} />
        <WeeklyShiftPanel
          context={context}
          shifts={shifts}
          weekRangeLabel={weekRangeLabel}
        />
      </div>
    </div>
  )
}

function MobileDashboardHeader({ context }: { context: DashboardMobileContext }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#075cff] shadow-sm ring-1 ring-[#dbe3ff]">
          <RocketIcon className="size-5 rotate-45" />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold tracking-tight">RocketRota</p>
          <p className="truncate text-xs font-medium text-[#747b91]">
            {context.workspaceName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative flex size-11 items-center justify-center rounded-full bg-white text-[#60687e] shadow-sm ring-1 ring-[#dbe3ff]">
          <BellIcon className="size-5" />
          <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-[#ef2d32] text-[11px] font-bold text-white">
            1
          </span>
          <span className="sr-only">Notifications</span>
        </button>
        <div className="flex size-12 items-center justify-center rounded-full bg-[#e8ddff] text-base font-bold text-[#6547cf]">
          {getUserInitials(context.userName)}
        </div>
      </div>
    </header>
  )
}

function MobileDashboardHero({
  shiftCountLabel,
  userName,
}: {
  shiftCountLabel: string
  userName: string
}) {
  return (
    <section className="relative mt-8 overflow-hidden pb-4">
      <div className="max-w-[15rem]">
        <p className="text-3xl font-bold tracking-tight">
          {getDashboardGreeting()}, {userName.split(" ")[0]}.
        </p>
        <p className="mt-2 text-base font-medium text-[#687087]">
          You have{" "}
          <span className="font-bold text-[#075cff]">{shiftCountLabel}</span>{" "}
          this week.
        </p>
      </div>
      <div className="absolute right-0 bottom-1 flex size-20 items-center justify-center rounded-[28px] bg-[#e4e8ff]">
        <RocketIcon className="size-10 rotate-45 text-[#075cff]" />
      </div>
    </section>
  )
}

function NextShiftPanel({
  context,
  shift,
}: {
  context: DashboardMobileContext
  shift: DashboardShiftSummary | null
}) {
  return (
    <section className="mt-2 rounded-[22px] border border-[#dbe3ff] bg-white/95 p-5 shadow-[0_16px_40px_rgba(27,42,89,0.10)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-[#075cff]">Next shift</h2>
        {shift ? (
          <span className="rounded-xl bg-[#eaf1ff] px-3 py-2 text-xs font-bold text-[#075cff]">
            {shift.dayLabel} {shift.dateLabel}
          </span>
        ) : null}
      </div>

      {shift ? (
        <div className="mt-5">
          <div className="flex gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#075cff] text-white shadow-lg shadow-blue-500/25">
              <CalendarIcon className="size-8" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#6c7288]">
                {shift.dayLabel} · {shift.dateLabel}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight">
                {shift.timeLabel}
              </p>
              <ShiftMeta icon={MapPinIcon} label={shift.locationName} />
              <ShiftMeta icon={UserRoundIcon} label={shift.zoneName} />
            </div>
          </div>

          <Link
            to={getRotaViewPath({
              shift,
              workspaceSlug: context.workspaceSlug,
              workspaceType: context.workspaceType,
            })}
            className="mt-5 flex h-14 items-center justify-center gap-2 rounded-xl bg-[#075cff] text-base font-bold text-white shadow-lg shadow-blue-500/20"
          >
            View shift
            <ChevronRightIcon className="size-5" />
          </Link>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl bg-[#f4f7ff] px-4 py-6 text-center text-sm font-medium text-[#747b91]">
          Published shifts assigned to you will appear here.
        </p>
      )}
    </section>
  )
}

function ShiftMeta({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) {
  return (
    <div className="mt-3 flex min-w-0 items-center gap-2 text-sm font-semibold text-[#687087]">
      <Icon className="size-5 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  )
}

export { MobileDashboardShell }
