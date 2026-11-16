import {
  CalendarDaysIcon,
  CircleAlertIcon,
  Clock3Icon,
  MapPinIcon,
} from "lucide-react"
import { getTeamSummary } from "../utils/team"
import type { ManagerDayData } from "../types"
import { Frame } from "@/components/panelui/frame"
import {
  dashboardCardFrameClassName,
  dashboardCardPanelClassName,
} from "@/features/dashboard/components/dashboard-card"
import { cn } from "@/lib/utils"

function ManagerDashboardSummary({
  className,
  data,
  attentionTotal,
  onScheduled,
  onWorking,
  onAttention,
  onAll,
}: {
  className?: string
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
    <div className={cn("hidden min-w-0 grid-cols-3 gap-6 md:grid", className)}>
      {items.map(
        ({ label, value, action, context, icon: Icon, highlighted }) => (
          <Frame
            key={label}
            variant="band"
            render={<button type="button" onClick={action} />}
            aria-label={`${label}: ${value}, ${context}`}
            className={cn(
              dashboardCardFrameClassName,
              "cursor-pointer text-start transition-colors hover:bg-accent/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
            )}
          >
            <Frame.Header
              render={<span />}
              className="min-h-9 w-full grid-cols-[minmax(0,1fr)_auto] group-data-[variant=band]/frame:px-4 group-data-[variant=band]/frame:py-1"
            >
              <span className="text-sm leading-4 font-semibold">{label}</span>
              <Frame.Action render={<span />} className="row-span-1">
                <Icon aria-hidden="true" className="size-4" />
              </Frame.Action>
            </Frame.Header>
            <Frame.Panel
              render={<span />}
              className={cn(
                dashboardCardPanelClassName,
                "w-full flex-1 gap-1.5 p-4 transition-colors group-hover/frame:bg-muted/25 motion-reduce:transition-none"
              )}
            >
              <span
                className={cn(
                  "text-3xl leading-9 font-bold tracking-tight tabular-nums",
                  highlighted && "text-amber-800 dark:text-amber-300"
                )}
              >
                {value}
              </span>
              <span className="text-xs leading-4 text-muted-foreground">
                {context}
              </span>
            </Frame.Panel>
          </Frame>
        )
      )}
    </div>
  )
}

export { ManagerDashboardSummary }
