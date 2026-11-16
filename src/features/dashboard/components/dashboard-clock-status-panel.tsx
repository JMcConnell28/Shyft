"use client"

import { Link } from "@tanstack/react-router"
import { Clock3Icon, ClockIcon, InfoIcon } from "lucide-react"

import { DashboardCard } from "./dashboard-card"

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
import { Badge } from "@/components/panelui/badge"

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
    <DashboardCard
      headingId="personal-clock-heading"
      action={
        <Badge
          size="sm"
          variant={clockStatus.openEntry ? "success" : "secondary"}
          dot
        >
          {clockStatus.openEntry ? "Clocked in" : "Not clocked in"}
        </Badge>
      }
      title="Time clock"
    >
      <div className="space-y-3 px-4 py-3">
        {clockStatus.openEntry ? (
          <div>
            <p className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
              {formatElapsedTime(openElapsedMs)}
            </p>
            <p className="text-xs wrap-anywhere text-muted-foreground">
              {clockStatus.openEntry.locationName} · Since{" "}
              {formatDateTime(clockStatus.openEntry.clockedInAt)}
            </p>
          </div>
        ) : null}

        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="text-xs text-muted-foreground">Today</dt>
            <dd className="text-sm font-semibold tabular-nums">
              {formatElapsedSummary(totalTodayMs)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Entries</dt>
            <dd className="text-sm font-semibold tabular-nums">
              {clockStatus.todayEntryCount}
            </dd>
          </div>
        </dl>
      </div>
    </DashboardCard>
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
    <section className="animate-in overflow-hidden rounded-[10px] bg-white shadow-[0_2px_9px_rgba(25,45,85,0.07)] ring-1 ring-[#dfe4ec] duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-3 px-3 pt-2.5">
        <Badge size="md" variant={isClockedIn ? "success" : "secondary"} dot>
          {isClockedIn ? "Clocked in" : "Not clocked in"}
        </Badge>
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export { DashboardClockStatusPanel }
