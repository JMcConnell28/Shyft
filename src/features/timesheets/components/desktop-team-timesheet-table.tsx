import { Fragment } from "react"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import type { TeamTimesheetTableProps } from "@/features/timesheets/components/team-timesheet-table.types"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmployeeWeekDetails } from "@/features/timesheets/components/employee-week-details"
import {
  TeamTimesheetEmployeeIdentity,
  TeamTimesheetVariance,
} from "@/features/timesheets/components/team-timesheet-employee"
import { TimesheetHealthBadge } from "@/features/timesheets/components/timesheet-status"
import { formatTimesheetDuration } from "@/features/timesheets/utils/timesheet-view"

const TEAM_TABLE_COLUMNS = [
  "Employee",
  "Status",
  "Scheduled",
  "Worked",
  "Payable",
  "Variance",
  "Issues",
  "",
] as const

function DesktopTeamTimesheetTable({
  employees,
  expandedEmployeeId,
  onEdit,
  onToggle,
}: TeamTimesheetTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#edf0f6] bg-[#fafbfe] hover:bg-[#fafbfe]">
          {TEAM_TABLE_COLUMNS.map((label) => (
            <TableHead
              className="h-9 px-4 text-[11px] text-[#7481a0]"
              key={label || "action"}
            >
              {label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => {
          const isExpanded = expandedEmployeeId === employee.employeeId

          return (
            <Fragment key={employee.employeeId}>
              <TableRow className="border-[#edf0f6] hover:bg-[#fafcff]">
                <TableCell className="px-4 py-3">
                  <TeamTimesheetEmployeeIdentity employee={employee} />
                </TableCell>
                <TableCell className="px-4">
                  <TimesheetHealthBadge timesheet={employee} />
                </TableCell>
                <HoursCell minutes={employee.scheduledMinutes} />
                <HoursCell minutes={employee.actualMinutes} />
                <HoursCell minutes={employee.payableMinutes} />
                <TableCell className="px-4">
                  <TeamTimesheetVariance employee={employee} />
                </TableCell>
                <TableCell className="px-4 font-semibold text-orange-700">
                  {employee.reviewCount + employee.openEntryCount || "\u2014"}
                </TableCell>
                <TableCell className="px-4 text-right">
                  <Button
                    aria-expanded={isExpanded}
                    className="h-8 rounded-lg border-[#dfe4ef] bg-white px-3 text-[#236cff] shadow-none"
                    onClick={() => onToggle(employee.employeeId)}
                    size="sm"
                    variant="outline"
                  >
                    {isExpanded ? "Hide" : "Review"}
                    {isExpanded ? (
                      <ChevronDownIcon className="size-3.5" />
                    ) : (
                      <ChevronRightIcon className="size-3.5" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
              {isExpanded ? (
                <TableRow className="border-[#edf0f6] hover:bg-white">
                  <TableCell className="bg-[#fafbfe] p-4" colSpan={8}>
                    <EmployeeWeekDetails employee={employee} onEdit={onEdit} />
                  </TableCell>
                </TableRow>
              ) : null}
            </Fragment>
          )
        })}
      </TableBody>
    </Table>
  )
}

function HoursCell({ minutes }: { minutes: number }) {
  return (
    <TableCell className="px-4 font-semibold">
      {formatTimesheetDuration(minutes)}
    </TableCell>
  )
}

export { DesktopTeamTimesheetTable }
