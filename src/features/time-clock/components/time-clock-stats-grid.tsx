import {
  AlertTriangleIcon,
  Clock3Icon,
  TimerIcon,
  UsersRoundIcon,
} from "lucide-react"

import type { ManagerClockStats } from "@/features/time-clock/utils/manager-clock-stats"
import { formatElapsedSummary } from "@/features/time-clock/utils/elapsed-time"
import { cn } from "@/lib/utils"

type MetricTone = "blue" | "green" | "orange" | "violet"

function TimeClockStatsGrid({ stats }: { stats: ManagerClockStats }) {
  return (
    <section
      aria-label="Time tracking overview"
      className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#e0e5ef] bg-white shadow-[0_8px_28px_rgba(26,43,83,0.045)] md:grid-cols-4"
    >
      <ClockMetric
        description="Currently clocked in"
        icon={Clock3Icon}
        label="Live headcount"
        tone="green"
        value={String(stats.openCount)}
      />
      <ClockMetric
        description="For the selected day"
        icon={TimerIcon}
        label="Tracked hours"
        tone="blue"
        value={formatElapsedSummary(stats.trackedMs)}
      />
      <ClockMetric
        description="In this workspace"
        icon={UsersRoundIcon}
        label="Team members"
        tone="violet"
        value={String(stats.teamCount)}
      />
      <ClockMetric
        description="Needs attention"
        icon={AlertTriangleIcon}
        label="Exceptions"
        tone="orange"
        value={String(stats.exceptionCount)}
      />
    </section>
  )
}

function ClockMetric({
  description,
  icon: Icon,
  label,
  tone,
  value,
}: {
  description: string
  icon: typeof Clock3Icon
  label: string
  tone: MetricTone
  value: string
}) {
  const toneClassName: Record<MetricTone, string> = {
    blue: "bg-blue-50 text-[#236cff]",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    violet: "bg-violet-50 text-violet-600",
  }

  return (
    <div className="min-w-0 border-r border-b border-[#edf0f6] p-4 even:border-r-0 nth-[n+3]:border-b-0 md:border-b-0 md:even:border-r md:last:border-r-0 sm:p-5">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg",
            toneClassName[tone]
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <p className="truncate text-[11px] font-semibold text-[#617096] sm:text-xs">
          {label}
        </p>
      </div>
      <p className="mt-3 truncate text-2xl leading-none font-bold tracking-[-0.04em] sm:text-[1.7rem]">
        {value}
      </p>
      <p className="mt-2 truncate text-[11px] font-medium text-[#8792ad] sm:text-xs">
        {description}
      </p>
    </div>
  )
}

export { TimeClockStatsGrid }
