import { Link } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  CircleStopIcon,
  ClockArrowUpIcon,
  HistoryIcon,
} from "lucide-react"

import type { ManagerClockActivityEntry } from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"
import {
  TimeClockEmptyState,
  TimeClockPanel,
  TimeClockPanelHeader,
} from "@/features/time-clock/components/time-clock-panel"
import {
  formatElapsedSummary,
  getElapsedMilliseconds,
} from "@/features/time-clock/utils/elapsed-time"
import { formatClockTime } from "@/features/time-clock/utils/manager-clock-formatters"
import { cn } from "@/lib/utils"

function TimeClockActivitySection({
  entries,
  liveNow,
  workspaceSlug,
}: {
  entries: Array<ManagerClockActivityEntry>
  liveNow: Date
  workspaceSlug: string
}) {
  const recentEntries = entries.slice(0, 8)

  return (
    <TimeClockPanel>
      <TimeClockPanelHeader
        action={
          <Button
            className="h-8 px-2 text-[#236cff]"
            nativeButton={false}
            render={
              <Link
                params={{ workspaceSlug }}
                to="/w/$workspaceSlug/timesheets"
              />
            }
            variant="ghost"
          >
            View timesheets
            <ArrowRightIcon className="size-3.5" />
          </Button>
        }
        icon={HistoryIcon}
        title="Recent activity"
      />
      {recentEntries.length === 0 ? (
        <div className="p-4">
          <TimeClockEmptyState>No activity for this date yet.</TimeClockEmptyState>
        </div>
      ) : (
        <div className="grid divide-y divide-[#edf0f6] md:grid-cols-2 md:divide-y-0">
          {recentEntries.map((entry) => (
            <ActivityRow entry={entry} key={entry.id} liveNow={liveNow} />
          ))}
        </div>
      )}
    </TimeClockPanel>
  )
}

function ActivityRow({
  entry,
  liveNow,
}: {
  entry: ManagerClockActivityEntry
  liveNow: Date
}) {
  const isOpen = entry.clockedOutAt === null
  const activityTime = entry.clockedOutAt ?? entry.clockedInAt
  const Icon = isOpen ? ClockArrowUpIcon : CircleStopIcon

  return (
    <div className="flex min-w-0 items-center gap-3 border-[#edf0f6] px-4 py-3 transition-colors hover:bg-[#fafcff] md:border-r md:border-b">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isOpen
            ? "bg-emerald-50 text-emerald-600"
            : "bg-[#f0f3f9] text-[#68769a]"
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#10204b]">
          {entry.employeeName}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-[#7481a0]">
          {isOpen ? "Clocked in" : "Clocked out"} · {entry.locationName}
        </p>
      </div>
      <div className="ml-auto shrink-0 text-right">
        <p className="text-xs font-semibold text-[#10204b]">
          {formatClockTime(activityTime)}
        </p>
        <p className="mt-1 text-[10px] font-medium text-[#8792ad]">
          {formatElapsedSummary(
            getElapsedMilliseconds(
              entry.clockedInAt,
              entry.clockedOutAt ? new Date(entry.clockedOutAt) : liveNow
            )
          )}
        </p>
      </div>
    </div>
  )
}

export { TimeClockActivitySection }
