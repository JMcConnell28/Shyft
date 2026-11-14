import { getDashboardWeekStart } from "./date"
import type {
  AttentionItem,
  DashboardLocation,
  DashboardTeamRowProps,
  TeamRow,
} from "../types"
import type { ManagerClockEmployee } from "@/features/time-clock/types"
import { getDateKeyInTimeZone } from "@/lib/time-zone"

function getTeamClockActions({
  row,
  location,
  isToday,
  clockEmployee,
}: Pick<
  DashboardTeamRowProps,
  "row" | "location" | "isToday" | "clockEmployee"
>): {
  employee: ManagerClockEmployee
  canClockIn: boolean
  canClockOut: boolean
} | null {
  if (
    !clockEmployee ||
    !isToday ||
    !row.isActive ||
    !location.attendanceEnabled ||
    !location.canWrite
  ) {
    return null
  }

  return {
    employee: clockEmployee,
    canClockIn: !clockEmployee.openEntry && !row.entryId,
    canClockOut: clockEmployee.openEntry?.id === row.entryId,
  }
}

function getTeamTimeEntry(
  row: TeamRow,
  location: DashboardLocation
): AttentionItem | null {
  if (!row.entryId || !row.clockedInAt) return null

  return {
    id: row.entryId,
    kind: row.requiresReview ? "review" : "missing_clock_out",
    employeeId: row.employeeId,
    employeeName: row.employeeName,
    locationId: location.id,
    locationName: location.name,
    timeZone: location.timeZone,
    occurredAt: row.clockedInAt,
    clockedOutAt: row.clockedOutAt,
    workDate:
      row.workDate ?? getDateKeyInTimeZone(row.clockedInAt, location.timeZone),
    segment: row.segment,
    assignmentId: row.assignmentId,
    reason:
      row.notes ??
      (row.requiresReview
        ? "No reason was recorded for this review."
        : "No additional notes were recorded."),
  }
}

function getDashboardTimesheetSearch(
  item: Pick<AttentionItem, "id" | "workDate">
): {
  entryId: string
  weekStart: string
} {
  return { entryId: item.id, weekStart: getDashboardWeekStart(item.workDate) }
}

export { getTeamClockActions, getTeamTimeEntry, getDashboardTimesheetSearch }
