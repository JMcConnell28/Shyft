import {
  CalendarDaysIcon,
  Clock3Icon,
  MapPinIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { getTeamSummary } from "../utils/team"
import type { ManagerDayData } from "../types"

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
      mobileLabel: "Scheduled",
      value: summary.scheduled,
      icon: CalendarDaysIcon,
      action: onScheduled,
    },
    data.location.attendanceEnabled
      ? {
          label: data.isToday ? "Working now" : "Staff clocked in",
          mobileLabel: data.isToday ? "Working now" : "Clocked in",
          value: data.isToday ? summary.working : summary.recorded,
          icon: Clock3Icon,
          action: data.isToday ? onWorking : onAll,
        }
      : {
          label: "Zones staffed",
          mobileLabel: "Zones staffed",
          value: new Set(data.team.map((row) => row.zone)).size,
          icon: MapPinIcon,
          action: onAll,
        },
    {
      label: "Needs attention",
      mobileLabel: "Attention",
      value: attentionTotal ?? "—",
      icon: TriangleAlertIcon,
      action: onAttention,
    },
  ]
  return (
    <div className="grid grid-cols-3 divide-x divide-[#e0e6f1] overflow-hidden rounded-xl border border-[#e0e6f1] bg-white sm:gap-3 sm:divide-x-0 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent">
      {items.map(({ label, mobileLabel, value, icon: Icon, action }) => (
        <button
          key={label}
          onClick={action}
          type="button"
          aria-label={`${label}: ${value}${label === "Needs attention" ? ", all permitted locations" : ""}`}
          className="flex min-w-0 flex-col px-3 py-3 text-left transition-colors hover:bg-blue-50/30 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none focus-visible:ring-inset active:bg-blue-50 sm:block sm:rounded-xl sm:border sm:border-[#e0e6f1] sm:bg-white sm:p-4 sm:hover:border-blue-300"
        >
          <div className="flex items-center justify-between gap-1 text-[#7481a0]">
            <span className="text-[11px] font-semibold sm:text-xs">
              <span className="sm:hidden">{mobileLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
            <Icon className="hidden size-4 sm:block" />
          </div>
          <p className="order-first mb-1 text-2xl leading-none font-bold text-[#10204b] tabular-nums sm:order-none sm:mt-2 sm:mb-0 sm:leading-8">
            {value}
          </p>
          {label === "Needs attention" ? (
            <p className="mt-1 text-[10px] text-[#7481a0]">
              <span className="sm:hidden">All locations</span>
              <span className="hidden sm:inline">All permitted locations</span>
            </p>
          ) : null}
        </button>
      ))}
    </div>
  )
}
export { ManagerDashboardSummary }
