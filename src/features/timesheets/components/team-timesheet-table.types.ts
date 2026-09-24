import type {
  ManagerTimesheetEmployee,
  TimesheetEntry,
} from "@/features/timesheets/types"

type TeamTimesheetTableProps = {
  canEditEntry: (entry: TimesheetEntry) => boolean
  employees: Array<ManagerTimesheetEmployee>
  expandedEmployeeId: string
  onEdit: (entry: TimesheetEntry) => void
  onToggle: (employeeId: string) => void
}

export type { TeamTimesheetTableProps }
