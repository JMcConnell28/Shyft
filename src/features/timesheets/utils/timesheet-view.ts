import type {
  ManagerTimesheetEmployee,
  TimesheetEntry,
  TimesheetTotals,
} from "@/features/timesheets/types"
import type {
  TeamTimesheetStatusFilter,
  TimesheetHealth,
} from "@/features/timesheets/utils/timesheet-view.types"
import { formatTime } from "@/features/timesheets/utils/timesheet-time"

function formatTimesheetDuration(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes))
  const hours = Math.floor(safeMinutes / 60)
  const remainingMinutes = safeMinutes % 60

  return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}m`
}

function formatTimesheetVariance(minutes: number) {
  if (minutes === 0) return "On schedule"

  return `${formatTimesheetDelta(minutes)} vs scheduled`
}

function formatTimesheetDelta(minutes: number) {
  if (minutes === 0) return "\u2014"

  const prefix = minutes > 0 ? "+" : "\u2212"
  return `${prefix}${formatTimesheetDuration(Math.abs(minutes))}`
}

function getTimesheetHealth(timesheet: TimesheetTotals): TimesheetHealth {
  if (timesheet.reviewCount > 0) return "attention"
  if (timesheet.openEntryCount > 0) return "open"
  return "ready"
}

function getEntryScheduleLabel(entry: TimesheetEntry | null) {
  if (!entry?.scheduledStartAt) return "No scheduled shift"
  return `${formatTime(entry.scheduledStartAt)} \u2013 ${formatTime(
    entry.scheduledEndAt
  )}`
}

function getEntryClockLabel(entry: TimesheetEntry | null) {
  if (!entry?.clockedInAt) return "Not clocked"
  return `${formatTime(entry.clockedInAt)} \u2013 ${formatTime(entry.clockedOutAt)}`
}

function filterTeamTimesheetEmployees(
  employees: Array<ManagerTimesheetEmployee>,
  filters: {
    location: string
    search: string
    status: TeamTimesheetStatusFilter
  }
) {
  const search = filters.search.trim().toLocaleLowerCase()

  return employees.filter((employee) => {
    const matchesSearch =
      search.length === 0 ||
      employee.employeeName.toLocaleLowerCase().includes(search)
    const matchesLocation =
      filters.location === "all" ||
      employee.locations.includes(filters.location)
    const matchesStatus =
      filters.status === "all" ||
      getTimesheetHealth(employee) === filters.status

    return matchesSearch && matchesLocation && matchesStatus
  })
}

export {
  filterTeamTimesheetEmployees,
  formatTimesheetDelta,
  formatTimesheetDuration,
  formatTimesheetVariance,
  getEntryClockLabel,
  getEntryScheduleLabel,
  getTimesheetHealth,
}
