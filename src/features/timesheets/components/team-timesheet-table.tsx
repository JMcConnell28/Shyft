import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import type {
  ManagerTimesheetEmployee,
  TimesheetEntry,
} from "@/features/timesheets/types"
import type { TeamTimesheetTableProps } from "@/features/timesheets/components/team-timesheet-table.types"
import { DesktopTeamTimesheetTable } from "@/features/timesheets/components/desktop-team-timesheet-table"
import { EmployeeWeekDetails } from "@/features/timesheets/components/employee-week-details"
import {
  TeamTimesheetEmployeeIdentity,
  TeamTimesheetVariance,
} from "@/features/timesheets/components/team-timesheet-employee"
import { TimesheetHealthBadge } from "@/features/timesheets/components/timesheet-status"
import { formatTimesheetDuration } from "@/features/timesheets/utils/timesheet-view"

function TeamTimesheetTable(props: TeamTimesheetTableProps) {
  if (props.employees.length === 0) {
    return (
      <p className="m-4 rounded-xl border border-dashed border-[#dfe4ef] bg-[#fafbfe] px-4 py-8 text-center text-sm font-medium text-[#7481a0]">
        No employees match these filters.
      </p>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <DesktopTeamTimesheetTable {...props} />
      </div>
      <div className="divide-y divide-[#edf0f6] md:hidden">
        {props.employees.map((employee) => (
          <MobileEmployeeRow
            employee={employee}
            isExpanded={props.expandedEmployeeId === employee.employeeId}
            key={employee.employeeId}
            onEdit={props.onEdit}
            onToggle={props.onToggle}
          />
        ))}
      </div>
    </>
  )
}

function MobileEmployeeRow({
  employee,
  isExpanded,
  onEdit,
  onToggle,
}: {
  employee: ManagerTimesheetEmployee
  isExpanded: boolean
  onEdit: (entry: TimesheetEntry) => void
  onToggle: (employeeId: string) => void
}) {
  return (
    <div>
      <button
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fafcff]"
        onClick={() => onToggle(employee.employeeId)}
        type="button"
      >
        <TeamTimesheetEmployeeIdentity employee={employee} />
        <div className="ml-auto shrink-0 text-right">
          <p className="text-sm font-semibold">
            {formatTimesheetDuration(employee.actualMinutes)}
          </p>
          <TeamTimesheetVariance employee={employee} />
        </div>
        {isExpanded ? (
          <ChevronDownIcon className="size-4 shrink-0 text-[#68769a]" />
        ) : (
          <ChevronRightIcon className="size-4 shrink-0 text-[#68769a]" />
        )}
      </button>
      <div className="flex items-center gap-2 px-4 pb-3 pl-15">
        <TimesheetHealthBadge timesheet={employee} />
        <span className="text-[10px] font-medium text-[#8792ad]">
          {formatTimesheetDuration(employee.payableMinutes)} payable
        </span>
      </div>
      {isExpanded ? (
        <div className="border-t border-[#edf0f6] bg-[#fafbfe] p-3">
          <EmployeeWeekDetails employee={employee} onEdit={onEdit} />
        </div>
      ) : null}
    </div>
  )
}

export { TeamTimesheetTable }
