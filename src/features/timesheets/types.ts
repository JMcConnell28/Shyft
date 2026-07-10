import type {
  ClockEntryStatus,
  ClockShiftSegment,
  ClockSource,
} from "@/features/time-clock/types"
import type {
  PayrollExportData,
  PayrollExportRow,
} from "@/features/payroll/types"

type TimesheetScopeInput = {
  organizationId?: string | null
  locationId?: string
  userId: string
  weekStart?: string | null
}

type TimesheetLocation = {
  id: string
  name: string
}

type TimesheetExportableRota = {
  id: string
  label: string
  locationId: string
  locationName: string
  weekStart: string
}

type TimesheetTotals = {
  actualMinutes: number
  openEntryCount: number
  payableMinutes: number
  reviewCount: number
  scheduledMinutes: number
}

type TimesheetEntry = {
  id: string | null
  actualMinutes: number
  clockedInAt: string | null
  clockedOutAt: string | null
  employeeId: string
  employeeName: string
  employeePayrollId: string | null
  locationId: string
  locationName: string
  notes: string | null
  payableEndAt: string | null
  payableMinutes: number
  payableStartAt: string | null
  publishedShiftId: string | null
  rotaId: string | null
  rotaLabel: string | null
  scheduledEndAt: string | null
  scheduledMinutes: number
  scheduledStartAt: string | null
  shiftSegment: ClockShiftSegment
  source: ClockSource | "scheduled"
  status: ClockEntryStatus | "scheduled"
  zoneName: string | null
}

type TimesheetDay = TimesheetTotals & {
  date: string
  dateLabel: string
  dayLabel: string
  entries: TimesheetEntry[]
}

type EmployeeTimesheet = TimesheetTotals & {
  employeeId: string | null
  employeeName: string
  days: TimesheetDay[]
}

type ManagerTimesheetEmployee = TimesheetTotals & {
  employeeId: string
  employeeName: string
  locations: string[]
  days: TimesheetDay[]
}

type ManagerTimesheet = TimesheetTotals & {
  employees: ManagerTimesheetEmployee[]
}

type TimesheetPageData = {
  canManage: boolean
  employeeTimesheet: EmployeeTimesheet
  exportableRotas: TimesheetExportableRota[]
  locations: TimesheetLocation[]
  managerTimesheet: ManagerTimesheet | null
  weekEnd: string
  weekLabel: string
  weekStart: string
}

type SageTimesheetExportInput = {
  organizationId?: string | null
  locationId?: string
  userId: string
  rotaId: string
}

type SageTimesheetExportRow = PayrollExportRow

type SageTimesheetExportData = PayrollExportData

type UpdateTimesheetEntryInput = {
  organizationId?: string | null
  locationId?: string
  userId: string
  entryId: string
  clockedInAt: string
  clockedOutAt: string | null
  payableStartAt: string
  payableEndAt: string | null
  status: ClockEntryStatus
  reason: string
  weekStart?: string | null
}

export type {
  EmployeeTimesheet,
  ManagerTimesheet,
  ManagerTimesheetEmployee,
  SageTimesheetExportData,
  SageTimesheetExportInput,
  SageTimesheetExportRow,
  TimesheetDay,
  TimesheetEntry,
  TimesheetExportableRota,
  TimesheetLocation,
  TimesheetPageData,
  TimesheetScopeInput,
  TimesheetTotals,
  UpdateTimesheetEntryInput,
}
