"use client"

import { Link } from "@tanstack/react-router"
import { Clock3Icon, ClockIcon, InfoIcon, TimerIcon } from "lucide-react"

import type {
  DashboardClockStatus,
  DashboardShiftSummary,
} from "@/features/dashboard/types"
import { useLiveNow } from "@/features/time-clock/hooks/use-live-now"
import {
  formatElapsedSummary,
  formatElapsedTime,
  getElapsedMilliseconds,
} from "@/features/time-clock/utils/elapsed-time"
import {
  DashboardPanel,
  DashboardPanelHeader,
} from "@/features/dashboard/components/dashboard-desktop-panel"
import { cn } from "@/lib/utils"

function DashboardClockStatusPanel({
  clockStatus,
  mobileDetailsHref,
  mobileShift,
  variant = "desktop",
}: {
  clockStatus: DashboardClockStatus
  mobileDetailsHref?: string
  mobileShift?: DashboardShiftSummary | null
  variant?: "desktop" | "mobile"
}) {
  const liveNow = useLiveNow(Boolean(clockStatus.openEntry))
  const openElapsedMs = clockStatus.openEntry
    ? getElapsedMilliseconds(clockStatus.openEntry.clockedInAt, liveNow)
    : 0
  const totalTodayMs = clockStatus.completedTodayMs + openElapsedMs
  const isMobile = variant === "mobile"

  if (isMobile) {
    return (
      <MobileClockStatus
        clockStatus={clockStatus}
        detailsHref={mobileDetailsHref}
        openElapsedMs={openElapsedMs}
        shift={mobileShift ?? null}
        totalTodayMs={totalTodayMs}
      />
    )
  }

  return (
    <DashboardPanel>
      <DashboardPanelHeader
        action={
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-[10px] px-2.5 py-1 text-[11px] font-semibold",
              clockStatus.openEntry
                ? "bg-[#e7f8f1] text-[#248964]"
                : "bg-[#f1f3f7] text-[#6f7688]"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                clockStatus.openEntry ? "bg-[#36ad7d]" : "bg-[#a7adba]"
              )}
            />
            {clockStatus.openEntry ? "Clocked in" : "Not clocked in"}
          </span>
        }
        icon={Clock3Icon}
        subtitle={
          clockStatus.openEntry
            ? `Since ${formatDateTime(clockStatus.openEntry.clockedInAt)}`
            : "Clock in at your workplace when you arrive"
        }
        title="Time clock"
      />

      <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_10rem]">
        <div className="rounded-[12px] border border-[#edf0f6] bg-[#fbfcff] px-4 py-3">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#7a86a4] uppercase">
            Current timer
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-[-0.04em] text-[#11245a] tabular-nums">
            {clockStatus.openEntry ? formatElapsedTime(openElapsedMs) : "0:00"}
          </p>
          <p className="mt-1 text-xs font-medium text-[#7a86a4]">
            {clockStatus.openEntry
              ? clockStatus.openEntry.locationName
              : "No active time entry"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          <ClockStat
            icon={TimerIcon}
            label="Today"
            value={formatElapsedSummary(totalTodayMs)}
          />
          <ClockStat
            icon={ClockIcon}
            label="Entries"
            value={String(clockStatus.todayEntryCount)}
          />
        </div>
      </div>
    </DashboardPanel>
  )
}

function MobileClockStatus({
  clockStatus,
  detailsHref,
  openElapsedMs,
  shift,
  totalTodayMs,
}: {
  clockStatus: DashboardClockStatus
  detailsHref?: string
  openElapsedMs: number
  shift: DashboardShiftSummary | null
  totalTodayMs: number
}) {
  const isClockedIn = Boolean(clockStatus.openEntry)
  const locationLabel = shift
    ? `${shift.locationName} · ${shift.zoneName}`
    : (clockStatus.openEntry?.locationName ?? "No active workplace")
  const timeLabel = shift?.timeLabel

  return (
    <section className="animate-in overflow-hidden rounded-xl bg-white shadow-[0_2px_9px_rgba(25,45,85,0.07)] ring-1 ring-[#dfe4ec] duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-3 px-3 pt-2.5">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-sm font-bold",
            isClockedIn
              ? "bg-[#e9f8ed] text-[#129238]"
              : "bg-[#f1f3f7] text-[#6f7688]"
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              isClockedIn ? "bg-[#36ad7d]" : "bg-[#a7adba]"
            )}
          />
          {isClockedIn ? "Clocked in" : "Not clocked in"}
        </span>
        <span className="flex size-7 items-center justify-center rounded-lg bg-[#edf2ff] text-[#0865f5]">
          <Clock3Icon className="size-[1.125rem]" />
        </span>
      </div>

      <div className="px-4 pt-2 pb-3.5 text-center">
        <p className="font-mono text-[2.5rem] leading-none font-semibold tracking-[-0.07em] text-[#071735] tabular-nums">
          {isClockedIn
            ? formatElapsedTime(openElapsedMs)
            : formatElapsedTime(totalTodayMs)}
        </p>
        <p className="mt-2 truncate text-base font-extrabold tracking-[-0.02em] text-[#102044]">
          {locationLabel}
        </p>
        {timeLabel ? (
          <p className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-[#51607e]">
            <ClockIcon className="size-4 text-[#0865f5]" />
            {timeLabel}
          </p>
        ) : null}
        <p className="mt-2 text-sm font-medium text-[#51607e]">
          {clockStatus.openEntry
            ? `Clocked in at ${formatDateTime(clockStatus.openEntry.clockedInAt)}`
            : clockStatus.todayEntryCount > 0
              ? `${clockStatus.todayEntryCount} completed ${clockStatus.todayEntryCount === 1 ? "entry" : "entries"} today`
              : "No time entries recorded today"}
        </p>
      </div>

      <div className="flex min-h-10 items-center justify-between gap-3 border-t border-[#e4e8ef] px-4 py-2.5">
        <p className="flex min-w-0 items-center gap-2 text-[0.8125rem] font-medium text-[#53617d]">
          <InfoIcon className="size-4 shrink-0 text-[#8590a8]" />
          <span className="truncate">
            {isClockedIn
              ? "Use clock-in station to clock out"
              : "Use a clock-in station to start your shift"}
          </span>
        </p>
        {detailsHref ? (
          <Link
            to={detailsHref}
            className="shrink-0 text-sm font-extrabold text-[#0865f5] transition-opacity active:opacity-70"
          >
            View shift details
          </Link>
        ) : null}
      </div>
    </section>
  )
}

function ClockStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClockIcon
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-[#edf0f6] bg-[#fbfcff] px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-[#7a86a4] uppercase">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 text-base font-bold text-[#11245a]">{value}</p>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export { DashboardClockStatusPanel }
