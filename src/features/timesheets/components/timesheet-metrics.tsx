import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  Clock3Icon,
  WalletCardsIcon,
} from "lucide-react"

import type {
  EmployeeTimesheet,
  ManagerTimesheet,
} from "@/features/timesheets/types"
import {
  formatTimesheetDuration,
  formatTimesheetVariance,
  getTimesheetHealth,
} from "@/features/timesheets/utils/timesheet-view"
import { cn } from "@/lib/utils"

type MetricTone = "blue" | "green" | "orange" | "violet"

function PersonalTimesheetMetrics({
  timesheet,
}: {
  timesheet: EmployeeTimesheet
}) {
  const health = getTimesheetHealth(timesheet)

  return (
    <TimesheetMetricGrid
      metrics={[
        {
          description: "Published shifts",
          icon: CalendarClockIcon,
          label: "Scheduled",
          tone: "violet",
          value: formatTimesheetDuration(timesheet.scheduledMinutes),
        },
        {
          description: formatTimesheetVariance(
            timesheet.actualMinutes - timesheet.scheduledMinutes
          ),
          icon: Clock3Icon,
          label: "Worked",
          tone: "blue",
          value: formatTimesheetDuration(timesheet.actualMinutes),
        },
        {
          description: "After adjustments",
          icon: WalletCardsIcon,
          label: "Payable",
          tone: "green",
          value: formatTimesheetDuration(timesheet.payableMinutes),
        },
        {
          description:
            health === "ready" ? "All records complete" : "Needs attention",
          icon: health === "ready" ? CheckCircle2Icon : AlertTriangleIcon,
          label: "Week status",
          tone: health === "ready" ? "green" : "orange",
          value: health === "ready" ? "Ready" : "Review",
        },
      ]}
    />
  )
}

function TeamTimesheetMetrics({ timesheet }: { timesheet: ManagerTimesheet }) {
  const attentionCount = timesheet.employees.filter(
    (employee) => getTimesheetHealth(employee) !== "ready"
  ).length

  return (
    <TimesheetMetricGrid
      metrics={[
        {
          description: "Across the team",
          icon: CalendarClockIcon,
          label: "Scheduled",
          tone: "violet",
          value: formatTimesheetDuration(timesheet.scheduledMinutes),
        },
        {
          description: formatTimesheetVariance(
            timesheet.actualMinutes - timesheet.scheduledMinutes
          ),
          icon: Clock3Icon,
          label: "Worked",
          tone: "blue",
          value: formatTimesheetDuration(timesheet.actualMinutes),
        },
        {
          description: "After adjustments",
          icon: WalletCardsIcon,
          label: "Payable",
          tone: "green",
          value: formatTimesheetDuration(timesheet.payableMinutes),
        },
        {
          description: "Employees to check",
          icon: AlertTriangleIcon,
          label: "Needs review",
          tone: "orange",
          value: String(attentionCount),
        },
      ]}
    />
  )
}

function TimesheetMetricGrid({ metrics }: { metrics: Array<Metric> }) {
  return (
    <section
      aria-label="Timesheet overview"
      className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#e0e5ef] bg-white shadow-[0_8px_28px_rgba(26,43,83,0.045)] md:grid-cols-4"
    >
      {metrics.map((metric) => (
        <MetricItem key={metric.label} {...metric} />
      ))}
    </section>
  )
}

type Metric = {
  description: string
  icon: typeof Clock3Icon
  label: string
  tone: MetricTone
  value: string
}

function MetricItem({ description, icon: Icon, label, tone, value }: Metric) {
  const toneClassName: Record<MetricTone, string> = {
    blue: "bg-blue-50 text-[#236cff]",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    violet: "bg-violet-50 text-violet-600",
  }

  return (
    <div className="min-w-0 border-r border-b border-[#edf0f6] p-4 even:border-r-0 nth-[n+3]:border-b-0 sm:p-5 md:border-b-0 md:last:border-r-0 md:even:border-r">
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
      <p className="mt-3 truncate text-xl leading-none font-bold tracking-[-0.04em] sm:text-[1.7rem]">
        {value}
      </p>
      <p className="mt-2 truncate text-[11px] font-medium text-[#8792ad] sm:text-xs">
        {description}
      </p>
    </div>
  )
}

export { PersonalTimesheetMetrics, TeamTimesheetMetrics }
