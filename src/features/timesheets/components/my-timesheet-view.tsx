import { InfoIcon } from "lucide-react"

import type { EmployeeTimesheet } from "@/features/timesheets/types"
import { EmployeeTimesheetEntries } from "@/features/timesheets/components/employee-timesheet-entries"
import { PersonalTimesheetMetrics } from "@/features/timesheets/components/timesheet-metrics"
import { TimesheetWeekComparison } from "@/features/timesheets/components/timesheet-week-comparison"

function MyTimesheetView({ timesheet }: { timesheet: EmployeeTimesheet }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <PersonalTimesheetMetrics timesheet={timesheet} />
      <TimesheetWeekComparison timesheet={timesheet} />
      <EmployeeTimesheetEntries days={timesheet.days} />
      <p className="flex items-center gap-2 px-1 text-xs font-medium text-[#7481a0]">
        <InfoIcon className="size-4 text-[#236cff]" />
        Only you can see this view. Managers have a separate team view.
      </p>
    </div>
  )
}

export { MyTimesheetView }
