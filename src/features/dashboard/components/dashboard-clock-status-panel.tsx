"use client"

import { Building2Icon, Clock3Icon, ClockIcon, TimerIcon } from "lucide-react"

import type { DashboardClockStatus } from "@/features/dashboard/types"
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
  variant = "desktop",
}: {
  clockStatus: DashboardClockStatus
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
        openElapsedMs={openElapsedMs}
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
            variant={variant}
          />
          <ClockStat
            icon={ClockIcon}
            label="Entries"
            value={String(clockStatus.todayEntryCount)}
            variant={variant}
          />
        </div>
      </div>
    </DashboardPanel>
  )
}

function MobileClockStatus({
  clockStatus,
  openElapsedMs,
  totalTodayMs,
}: {
  clockStatus: DashboardClockStatus
  openElapsedMs: number
  totalTodayMs: number
}) {
  const isClockedIn = Boolean(clockStatus.openEntry)

  return (
    <section className="animate-in rounded-[20px] bg-white p-4 shadow-[0_5px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7e9f0] duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#e7f8f1] text-[#24966a]">
            <Clock3Icon className="size-5" />
          </span>
          <h2 className="text-[17px] font-extrabold tracking-[-0.02em]">
            Time tracking
          </h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold",
            isClockedIn
              ? "bg-[#e9f8f2] text-[#248964]"
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
      </div>

      <div className="mt-5 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-[#5575e7]">
          <Building2Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold">
            {clockStatus.openEntry?.locationName ?? "No active workplace"}
          </p>
          <p className="mt-0.5 text-sm font-medium text-[#7b8195]">
            {isClockedIn ? "Active time entry" : "Today so far"}
          </p>
        </div>
      </div>

      <p className="mt-5 font-mono text-[2.65rem] leading-none font-medium tracking-[-0.04em] tabular-nums">
        {isClockedIn
          ? formatElapsedTime(openElapsedMs)
          : formatElapsedTime(totalTodayMs)}
      </p>
      <p className="mt-2 text-sm font-medium text-[#7b8195]">
        {clockStatus.openEntry
          ? `Started at ${formatDateTime(clockStatus.openEntry.clockedInAt)}`
          : clockStatus.todayEntryCount > 0
            ? `${clockStatus.todayEntryCount} completed ${clockStatus.todayEntryCount === 1 ? "entry" : "entries"} today`
            : "No time entries recorded today"}
      </p>
    </section>
  )
}

function ClockStat({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: typeof ClockIcon
  label: string
  value: string
  variant: "desktop" | "mobile"
}) {
  const isMobile = variant === "mobile"

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3",
        isMobile ? "border-[#dbe3ff] bg-white" : "border-[#edf0f6] bg-[#fbfcff]"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs font-bold uppercase",
          isMobile ? "text-[#687087]" : "text-[#7a86a4]"
        )}
      >
        <Icon className="size-3.5" />
        {label}
      </div>
      <p
        className={cn(
          "mt-1 text-base font-bold",
          isMobile ? "text-[#080d23]" : "text-[#11245a]"
        )}
      >
        {value}
      </p>
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
