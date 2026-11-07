import {
  CalendarDaysIcon,
  CircleAlertIcon,
  Clock3Icon,
  MapPinIcon,
} from "lucide-react"
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
    {
      label: "Scheduled",
      value: summary.scheduled,
      action: onScheduled,
      context: "Employees on the published schedule",
      icon: CalendarDaysIcon,
    },
    data.location.attendanceEnabled
      ? {
          label: data.isToday ? "Working now" : "Clocked in",
          value: data.isToday ? summary.working : summary.recorded,
          action: data.isToday ? onWorking : onAll,
          context: data.isToday
            ? "Currently clocked in at this location"
            : "Employees with recorded attendance",
          icon: Clock3Icon,
        }
      : {
          label: "Zones staffed",
          value: new Set(data.team.map((row) => row.zone)).size,
          action: onAll,
          context: "Zones on the published schedule",
          icon: MapPinIcon,
        },
    {
      label: "Attention",
      value: attentionTotal ?? "—",
      action: onAttention,
      context: "All locations and dates",
      icon: CircleAlertIcon,
      highlighted: Boolean(attentionTotal),
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-6">
      {items.map(
        ({ label, value, action, context, icon: Icon, highlighted }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            aria-label={`${label}: ${value}, ${context}`}
            className="group flex min-w-0 flex-col rounded-[14px] border border-border bg-muted/30 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="flex min-h-12 w-full items-center justify-between gap-2 px-3 py-2.5 text-xs font-medium sm:min-h-13 sm:px-4 sm:text-sm">
              <span>{label}</span>
              <Icon
                aria-hidden="true"
                className="hidden size-4 shrink-0 text-muted-foreground sm:block"
              />
            </span>
            <span className="flex w-full flex-1 flex-col gap-1.5 rounded-b-[13px] border-t border-border/60 bg-card px-3 py-3 transition-colors group-hover:bg-card/80 sm:p-4">
              <span
                className={cn(
                  "text-2xl leading-8 font-bold tracking-tight tabular-nums sm:text-3xl sm:leading-9",
                  highlighted && "text-amber-800 dark:text-amber-300"
                )}
              >
                {value}
              </span>
              <span
                className={cn(
                  "text-xs leading-4 text-muted-foreground",
                  label !== "Attention" && "hidden sm:block"
                )}
              >
                {context}
              </span>
            </span>
          </button>
        )
      )}
    </div>
  )
}

export { ManagerDashboardSummary }
