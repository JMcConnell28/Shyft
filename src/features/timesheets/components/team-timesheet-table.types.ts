import type {
  ManagerTimesheetEmployee,
  TimesheetEntry,
} from "@/features/timesheets/types"

type TeamTimesheetTableProps = {
  employees: Array<ManagerTimesheetEmployee>
  expandedEmployeeId: string
  onEdit: (entry: TimesheetEntry) => void
  onToggle: (employeeId: string) => void
}

export type { TeamTimesheetTableProps }
