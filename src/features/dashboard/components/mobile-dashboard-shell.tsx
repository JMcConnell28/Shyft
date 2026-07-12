import { Link } from "@tanstack/react-router"
import { format, isTomorrow, parseISO } from "date-fns"
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  Clock3Icon,
  MapPinIcon,
  UserRoundIcon,
} from "lucide-react"

import type { DashboardAnnouncements } from "@/features/announcements/types"
import type { DashboardMobileContext } from "@/features/dashboard/components/dashboard-mobile-types"
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
  weekHoursLabel: string | null
}

function MobileDashboardShell({
  announcements,
  announcementsHref,
  clockStatus,
  context,
  nextShift,
  shifts,
  weekHoursLabel,
}: MobileDashboardShellProps) {
  const activeShift = shifts.find((shift) => shift.date === getLocalDateValue())

  return (
    <div className="min-h-full bg-[#fffefe] text-[#0b1836] md:hidden">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <MobileDashboardHero userName={context.userName} />
        <DashboardClockStatusPanel
          clockStatus={clockStatus}
          mobileDetailsHref={
            activeShift
              ? getRotaViewPath({
                  shift: activeShift,
                  workspaceSlug: context.workspaceSlug,
                  workspaceType: context.workspaceType,
                })
              : undefined
          }
          mobileShift={activeShift}
          variant="mobile"
        />
        <DashboardAnnouncementsPanel
          announcements={announcements}
          href={announcementsHref}
          variant="mobile"
        />
        <NextShiftPanel context={context} shift={nextShift} />
        <WeeklyShiftPanel
          context={context}
          shifts={shifts}
          weekHoursLabel={weekHoursLabel}
        />
      </div>
    </div>
  )
}

function MobileDashboardHero({ userName }: { userName: string }) {
  return (
    <section className="animate-in pb-3 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <h1 className="text-[1.375rem] leading-[1.18] font-extrabold tracking-[-0.035em] text-[#0b1836]">
        {getDashboardGreeting()}, {userName.split(" ")[0]}
      </h1>
      <p className="mt-1 text-[0.9375rem] font-medium text-[#52617e]">
        Here&apos;s what&apos;s happening today
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
    <section className="mt-5 animate-in duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <h2 className="text-lg leading-tight font-extrabold tracking-[-0.025em] text-[#0b1836]">
        Next shift
      </h2>

      {shift && date ? (
        <Link
          to={getRotaViewPath({
            shift,
            workspaceSlug: context.workspaceSlug,
            workspaceType: context.workspaceType,
          })}
          className="mt-2.5 grid grid-cols-[3.1rem_minmax(0,1fr)] gap-3 rounded-xl bg-white p-2.5 shadow-[0_2px_9px_rgba(25,45,85,0.07)] ring-1 ring-[#e0e5ed] transition-colors active:bg-[#f8faff]"
        >
          <ShiftDateTile date={date} />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-[0.9375rem] leading-tight font-extrabold tracking-[-0.02em] text-[#102044]">
                {getNextShiftDateLabel(shift.date)}
              </p>
              {shift.durationLabel ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#596886]">
                  <CalendarDaysIcon className="size-3.5 text-[#70809c]" />
                  {shift.durationLabel}
                </span>
              ) : null}
            </div>
            <div className="mt-2 grid gap-1 text-sm font-medium text-[#53617d]">
              <ShiftMeta icon={Clock3Icon} label={shift.timeLabel} />
              <ShiftMeta icon={UserRoundIcon} label={shift.zoneName} />
              <ShiftMeta icon={MapPinIcon} label={shift.locationName} />
            </div>
            <span className="mt-2 flex items-center justify-end gap-1 text-sm font-extrabold text-[#0865f5]">
              View shift
              <ChevronRightIcon className="size-4" strokeWidth={2.5} />
            </span>
          </div>
        </Link>
      ) : (
        <div className="mt-2.5 rounded-xl bg-white px-4 py-6 text-center text-sm font-medium text-[#66738d] shadow-[0_2px_9px_rgba(25,45,85,0.07)] ring-1 ring-[#e0e5ed]">
          Your next assigned shift will appear here.
        </div>
      )}
    </section>
  )
}

function ShiftDateTile({
  date,
}: {
  date: ReturnType<typeof getShiftDateParts>
}) {
  return (
    <div className="overflow-hidden rounded-md border border-[#d9dfeb] text-center">
      <p className="bg-[#0865f5] py-1 text-[0.625rem] font-extrabold tracking-[0.05em] text-white uppercase">
        {date.month}
      </p>
      <p className="pt-2 text-[1.5rem] leading-none font-extrabold tracking-[-0.05em] text-[#102044]">
        {date.dayNumber}
      </p>
      <p className="pt-1 pb-2 text-[0.625rem] font-extrabold tracking-[0.06em] text-[#0865f5] uppercase">
        {date.day}
      </p>
    </div>
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

function getNextShiftDateLabel(date: string) {
  const parsedDate = parseISO(date)

  return isTomorrow(parsedDate)
    ? `Tomorrow, ${format(parsedDate, "d MMMM")}`
    : format(parsedDate, "EEEE, d MMMM")
}

function getLocalDateValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export { MobileDashboardShell }
