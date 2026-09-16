import type { ManagerTimesheetEmployee } from "@/features/timesheets/types"
import { TimesheetEmployeeAvatar } from "@/features/timesheets/components/timesheet-status"
import { formatTimesheetDelta } from "@/features/timesheets/utils/timesheet-view"
import { cn } from "@/lib/utils"

function TeamTimesheetEmployeeIdentity({
  employee,
}: {
  employee: ManagerTimesheetEmployee
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <TimesheetEmployeeAvatar name={employee.employeeName} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {employee.employeeName}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-[#7481a0]">
          {employee.locations.join(", ") || "No location"}
        </p>
      </div>
    </div>
  )
}

function TeamTimesheetVariance({
  employee,
}: {
  employee: ManagerTimesheetEmployee
}) {
  const variance = employee.actualMinutes - employee.scheduledMinutes

  return (
    <span
      className={cn(
        "text-[11px] font-semibold",
        variance > 0 && "text-emerald-700",
        variance < 0 && "text-rose-600",
        variance === 0 && "text-[#8792ad]"
      )}
    >
      {formatTimesheetDelta(variance)}
    </span>
  )
}

export { TeamTimesheetEmployeeIdentity, TeamTimesheetVariance }
