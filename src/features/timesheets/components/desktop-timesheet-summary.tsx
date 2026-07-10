import {
  BriefcaseBusinessIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
} from "lucide-react"

import type { TimesheetPageData } from "@/features/timesheets/types"
import { formatHours } from "@/features/timesheets/utils/timesheet-time"

function DesktopTimesheetSummary({
  entryCount,
  needsReview,
  timesheet,
}: {
  entryCount: number
  needsReview: boolean
  timesheet: TimesheetPageData["employeeTimesheet"]
}) {
  return (
    <div className="grid grid-cols-4 divide-x divide-[#edf0f6] border-t border-[#edf0f6] bg-[#fbfcff]">
      <SummaryMetric
        icon={Clock3Icon}
        label="Total hours"
        value={formatHours(timesheet.actualMinutes)}
      />
      <SummaryMetric
        icon={CalendarDaysIcon}
        label="Payable"
        value={formatHours(timesheet.payableMinutes)}
      />
      <SummaryMetric
        icon={BriefcaseBusinessIcon}
        label="Entries"
        value={String(entryCount)}
      />
      <SummaryMetric
        icon={CheckCircle2Icon}
        label="Status"
        value={needsReview ? "Review" : "Ready"}
      />
    </div>
  )
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3Icon
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-[#eef3ff] text-[#0069ff]">
          <Icon className="size-3.5" />
        </span>
        <p className="truncate text-xs font-semibold text-[#7a86a4]">{label}</p>
      </div>
      <p className="mt-2 truncate text-xl leading-none font-semibold tracking-[-0.02em] text-[#11245a]">
        {value}
      </p>
    </div>
  )
}

export { DesktopTimesheetSummary }
