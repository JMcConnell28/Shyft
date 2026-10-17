import {
  CalendarDaysIcon,
  Clock3Icon,
  MapPinIcon,
  TriangleAlertIcon,
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
      label: "Staff scheduled",
      value: summary.scheduled,
      icon: CalendarDaysIcon,
      action: onScheduled,
    },
    data.location.attendanceEnabled
      ? {
          label: data.isToday ? "Working now" : "Staff clocked in",
          value: data.isToday ? summary.working : summary.recorded,
          icon: Clock3Icon,
          action: data.isToday ? onWorking : onAll,
        }
      : {
          label: "Zones staffed",
          value: new Set(data.team.map((row) => row.zone)).size,
          icon: MapPinIcon,
          action: onAll,
        },
    {
      label: "Needs attention",
      value: attentionTotal ?? "—",
      icon: TriangleAlertIcon,
      action: onAttention,
    },
  ]
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map(({ label, value, icon: Icon, action }) => (
        <button
          key={label}
          onClick={action}
          type="button"
          className={cn(
            "rounded-xl border border-[#e0e6f1] bg-white p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/30 focus-visible:ring-2 focus-visible:ring-blue-300 sm:p-4"
          )}
        >
          <div className="flex items-center justify-between gap-1 text-[#7481a0]">
            <span className="text-[11px] font-semibold sm:text-xs">
              {label}
            </span>
            <Icon className="hidden size-4 sm:block" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#10204b] tabular-nums">
            {value}
          </p>
          {label === "Needs attention" ? (
            <p className="mt-1 text-[10px] text-[#7481a0]">
              All permitted locations
            </p>
          ) : null}
        </button>
      ))}
    </div>
  )
}
export { ManagerDashboardSummary }
