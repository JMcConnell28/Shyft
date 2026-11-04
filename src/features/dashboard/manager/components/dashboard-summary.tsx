import { getTeamSummary } from "../utils/team"
import type { ManagerDayData } from "../types"
import { cn } from "@/lib/utils"

function ManagerDashboardSummary({
  data,
  attentionTotal,
  onScheduled,
  onWorking,
  onAttention,
  onAll,
}: {
  data: ManagerDayData
  attentionTotal: number | undefined
  onScheduled: () => void
  onWorking: () => void
  onAttention: () => void
  onAll: () => void
}) {
  const summary = getTeamSummary(data.team)
  const items = [
    { label: "Scheduled", value: summary.scheduled, action: onScheduled },
    data.location.attendanceEnabled
      ? {
          label: data.isToday ? "Working now" : "Clocked in",
          value: data.isToday ? summary.working : summary.recorded,
          action: data.isToday ? onWorking : onAll,
        }
      : {
          label: "Zones staffed",
          value: new Set(data.team.map((row) => row.zone)).size,
          action: onAll,
        },
    {
      label: "Attention",
      value: attentionTotal ?? "—",
      action: onAttention,
      scope: "All locations and dates",
      highlighted: Boolean(attentionTotal),
    },
  ]

  return (
    <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card">
      {items.map(({ label, value, action, scope, highlighted }) => (
        <button
          key={label}
          type="button"
          onClick={action}
          aria-label={
            scope ? `${label}: ${value}, ${scope}` : `${label}: ${value}`
          }
          className="flex min-h-12 min-w-0 items-center justify-between gap-1 px-2.5 text-left transition-colors first:rounded-l-xl last:rounded-r-xl hover:bg-muted/60 focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:gap-3 sm:px-4"
        >
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </span>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums sm:text-base",
              highlighted && "text-amber-800 dark:text-amber-300"
            )}
          >
            {value}
          </span>
        </button>
      ))}
    </div>
  )
}

export { ManagerDashboardSummary }
