import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import type { EmployeeTimesheet } from "@/features/timesheets/types"
import {
  TimesheetPanel,
  TimesheetPanelHeader,
} from "@/features/timesheets/components/timesheet-panel"
import {
  formatTimesheetDuration,
  formatTimesheetVariance,
} from "@/features/timesheets/utils/timesheet-view"
import { cn } from "@/lib/utils"

function TimesheetWeekComparison({
  timesheet,
}: {
  timesheet: EmployeeTimesheet
}) {
  const variance = timesheet.actualMinutes - timesheet.scheduledMinutes
  const maximum = Math.max(
    timesheet.scheduledMinutes,
    timesheet.actualMinutes,
    1
  )

  return (
    <TimesheetPanel>
      <TimesheetPanelHeader
        subtitle="Scheduled and worked hours for the selected week"
        title="Your week at a glance"
      />
      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="space-y-4">
          <ProgressRow
            label="Scheduled"
            maximum={maximum}
            minutes={timesheet.scheduledMinutes}
            tone="scheduled"
          />
          <ProgressRow
            label="Worked"
            maximum={maximum}
            minutes={timesheet.actualMinutes}
            tone="worked"
          />
        </div>
        <div
          className={cn(
            "flex items-center justify-between rounded-xl px-4 py-3",
            variance >= 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          )}
        >
          <div>
            <p className="text-lg font-bold tracking-[-0.03em]">
              {formatTimesheetVariance(variance).split(" vs")[0]}
            </p>
            <p className="mt-1 text-xs font-medium">Compared with schedule</p>
          </div>
          {variance >= 0 ? (
            <TrendingUpIcon className="size-5" />
          ) : (
            <TrendingDownIcon className="size-5" />
          )}
        </div>
      </div>
    </TimesheetPanel>
  )
}

function ProgressRow({
  label,
  maximum,
  minutes,
  tone,
}: {
  label: string
  maximum: number
  minutes: number
  tone: "scheduled" | "worked"
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold">
        <span className="text-[#617096]">{label}</span>
        <span>{formatTimesheetDuration(minutes)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#edf1f7]">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none",
            tone === "worked" ? "bg-[#236cff]" : "bg-[#b9d0ff]"
          )}
          style={{
            width: `${minutes === 0 ? 0 : Math.max(4, (minutes / maximum) * 100)}%`,
          }}
        />
      </div>
    </div>
  )
}

export { TimesheetWeekComparison }
