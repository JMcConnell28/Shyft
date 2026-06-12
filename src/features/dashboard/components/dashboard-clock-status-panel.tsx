"use client"

import { ClockIcon, MapPinIcon, TimerIcon } from "lucide-react"

import type { DashboardClockStatus } from "@/features/dashboard/types"
import { useLiveNow } from "@/features/time-clock/hooks/use-live-now"
import {
  formatElapsedSummary,
  formatElapsedTime,
  getElapsedMilliseconds,
} from "@/features/time-clock/utils/elapsed-time"
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

  return (
    <section
      className={cn(
        "border bg-white shadow-sm",
        isMobile
          ? "mt-3 rounded-[22px] border-[#dbe3ff] p-5 shadow-[0_16px_40px_rgba(27,42,89,0.10)]"
          : "rounded-xl border-border/70 p-5",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={cn(
              "text-xs font-bold uppercase",
              isMobile ? "text-[#687087]" : "text-muted-foreground",
            )}
          >
            Time clock
          </p>
          <h2
            className={cn(
              "mt-1 font-bold tracking-tight",
              isMobile ? "text-xl text-[#080d23]" : "text-lg text-foreground",
            )}
          >
            {clockStatus.openEntry ? "You are clocked in" : "Not clocked in"}
          </h2>
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            clockStatus.openEntry
              ? "bg-[#075cff] text-white"
              : "bg-[#eef4ff] text-[#075cff]",
          )}
        >
          <ClockIcon className="size-5" />
        </div>
      </div>

      <div
        className={cn(
          "mt-4 rounded-2xl px-4 py-4",
          isMobile ? "bg-[#f4f7ff]" : "bg-muted/20",
        )}
      >
        <p
          className={cn(
            "text-xs font-bold uppercase",
            isMobile ? "text-[#687087]" : "text-muted-foreground",
          )}
        >
          Current timer
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-4xl font-bold tracking-tight",
            isMobile ? "text-[#075cff]" : "text-foreground",
          )}
        >
          {clockStatus.openEntry ? formatElapsedTime(openElapsedMs) : "0:00"}
        </p>
        <p
          className={cn(
            "mt-2 text-sm font-medium",
            isMobile ? "text-[#687087]" : "text-muted-foreground",
          )}
        >
          {clockStatus.openEntry
            ? `Since ${formatDateTime(clockStatus.openEntry.clockedInAt)}`
            : "Tap the venue NFC tag when you arrive."}
        </p>
      </div>

      {clockStatus.openEntry ? (
        <div
          className={cn(
            "mt-4 flex items-center gap-2 text-sm font-semibold",
            isMobile ? "text-[#687087]" : "text-muted-foreground",
          )}
        >
          <MapPinIcon className="size-4 shrink-0" />
          <span className="truncate">{clockStatus.openEntry.locationName}</span>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
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
        isMobile ? "border-[#dbe3ff] bg-white" : "border-border/70 bg-muted/10",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs font-bold uppercase",
          isMobile ? "text-[#687087]" : "text-muted-foreground",
        )}
      >
        <Icon className="size-3.5" />
        {label}
      </div>
      <p
        className={cn(
          "mt-1 text-base font-bold",
          isMobile ? "text-[#080d23]" : "text-foreground",
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
