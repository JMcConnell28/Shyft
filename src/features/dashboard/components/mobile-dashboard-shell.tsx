import { Link } from "@tanstack/react-router"
import {
  CalendarIcon,
  Clock3Icon,
  MapPinIcon,
  UserRoundIcon,
} from "lucide-react"

import type { DashboardMobileContext } from "@/features/dashboard/components/dashboard-mobile-types"
import type { DashboardAnnouncements } from "@/features/announcements/types"
import type {
  DashboardClockStatus,
  DashboardShiftSummary,
} from "@/features/dashboard/types"
import { DashboardAnnouncementsPanel } from "@/features/announcements/components/dashboard-announcements-panel"
import { DashboardClockStatusPanel } from "@/features/dashboard/components/dashboard-clock-status-panel"
import { WeeklyShiftPanel } from "@/features/dashboard/components/mobile-shift-list"
import {
  getDashboardGreeting,
  getRotaViewPath,
  getShiftDateParts,
} from "@/features/dashboard/utils/shift-display"

type MobileDashboardShellProps = {
  announcements: DashboardAnnouncements
  announcementsHref: string
  clockStatus: DashboardClockStatus
  context: DashboardMobileContext
  nextShift: DashboardShiftSummary | null
  shifts: Array<DashboardShiftSummary>
  weekRangeLabel: string
}

function MobileDashboardShell({
  announcements,
  announcementsHref,
  clockStatus,
  context,
  nextShift,
  shifts,
  weekRangeLabel,
}: MobileDashboardShellProps) {
  return (
    <div className="min-h-full bg-[#f7f8fb] text-[#142453] md:hidden">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-4 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <MobileDashboardHero userName={context.userName} />
        <DashboardClockStatusPanel clockStatus={clockStatus} variant="mobile" />
        <DashboardAnnouncementsPanel
          announcements={announcements}
          href={announcementsHref}
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

function MobileDashboardHero({ userName }: { userName: string }) {
  return (
    <section className="animate-in pb-6 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <h1 className="text-xl leading-[1.12] font-extrabold tracking-[-0.04em]">
        {getDashboardGreeting()}, {userName.split(" ")[0]}{" "}
        <span aria-hidden="true">{"\u{1F44B}"}</span>
      </h1>
      <p className="mt-2 text-sm font-medium text-[#7b8195]">
        Here&apos;s your shift overview.
      </p>
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
  const date = shift ? getShiftDateParts(shift.date) : null

  return (
    <section className="mt-3 animate-in rounded-[20px] bg-white p-4 shadow-[0_5px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7e9f0] duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4d6ee8]">
            <CalendarIcon className="size-5" />
          </span>
          <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
            Next shift
          </h2>
        </div>
        {shift ? <ScheduleLink context={context} shift={shift} /> : null}
      </div>

      {shift && date ? (
        <Link
          to={getRotaViewPath({
            shift,
            workspaceSlug: context.workspaceSlug,
            workspaceType: context.workspaceType,
          })}
          className="mt-4 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 rounded-2xl transition-colors active:bg-[#f7f9ff]"
        >
          <div className="flex size-20 flex-col items-center justify-center rounded-2xl bg-[#f0f3ff]">
            <span className="text-xs font-bold tracking-[0.08em] uppercase">
              {date.day}
            </span>
            <strong className="mt-0.5 text-[2rem] leading-none font-medium">
              {date.dayNumber}
            </strong>
            <span className="mt-1 text-xs font-bold tracking-[0.08em] uppercase">
              {date.month}
            </span>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <ShiftMeta icon={Clock3Icon} label={shift.timeLabel} />
            <ShiftMeta icon={UserRoundIcon} label={shift.zoneName} />
            <ShiftMeta icon={MapPinIcon} label={shift.locationName} />
          </div>
        </Link>
      ) : (
        <p className="mt-4 rounded-2xl bg-[#f4f6fc] px-4 py-6 text-center text-sm font-medium text-[#747b91]">
          Published shifts assigned to you will appear here.
        </p>
      )}
    </section>
  )
}

function ScheduleLink({
  context,
  shift,
}: {
  context: DashboardMobileContext
  shift: DashboardShiftSummary
}) {
  return (
    <Link
      to={getRotaViewPath({
        shift,
        workspaceSlug: context.workspaceSlug,
        workspaceType: context.workspaceType,
      })}
      className="rounded-xl border border-[#cdd7f7] px-3 py-2 text-xs font-bold text-[#4265df] transition-colors active:bg-[#eef2ff]"
    >
      View full schedule
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
    <div className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-[#4c5675] first:pt-0">
      <Icon className="size-4.5 shrink-0 text-[#5c7bea]" />
      <span className="truncate">{label}</span>
    </div>
  )
}

export { MobileDashboardShell }
