import {
  CalendarDaysIcon,
  CircleAlertIcon,
  Clock3Icon,
  MapPinIcon,
} from "lucide-react"
import { getTeamSummary } from "../utils/team"
import type { ManagerDayData } from "../types"
import { Frame } from "@/components/panelui/frame"
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
          <Frame
            key={label}
            variant="band"
            render={<button type="button" onClick={action} />}
            aria-label={`${label}: ${value}, ${context}`}
            className="min-w-0 cursor-pointer text-start transition-colors hover:bg-accent/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            <Frame.Header
              render={<span />}
              className="min-h-11 w-full group-data-[variant=band]/frame:px-1.5 group-data-[variant=band]/frame:py-1.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:group-data-[variant=band]/frame:px-4"
            >
              <span className="text-xs leading-4 font-semibold sm:text-sm">
                {label}
              </span>
              <Frame.Action
                render={<span />}
                className="row-span-1 hidden sm:block"
              >
                <Icon aria-hidden="true" className="size-4" />
              </Frame.Action>
            </Frame.Header>
            <Frame.Panel
              render={<span />}
              className="w-full flex-1 gap-1 px-2 py-2.5 transition-colors group-hover/frame:bg-muted/25 motion-reduce:transition-none sm:gap-1.5 sm:p-4"
            >
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
            </Frame.Panel>
          </Frame>
        )
      )}
    </div>
  )
}

export { ManagerDashboardSummary }
