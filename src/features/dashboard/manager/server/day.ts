import "@tanstack/react-start/server-only"

import { buildDashboardTeam } from "../utils/team"
import {
  requireDashboardLocation,
  resolveManagerDashboardAccess,
} from "./access"
import {
  listDashboardAttendance,
  listDashboardPlanning,
  listDashboardSchedule,
} from "./day-records"
import type { ManagerClockEmployee } from "@/features/time-clock/types"
import type { ManagerDayData, ManagerDayInput } from "../types"
import { getDateKeyInTimeZone } from "@/lib/time-zone"

async function getManagerDashboardDay(
  input: ManagerDayInput
): Promise<ManagerDayData> {
  const access = await resolveManagerDashboardAccess(input.organizationId)
  const location = requireDashboardLocation(access.locations, input.locationId)
  const now = new Date()
  const today = getDateKeyInTimeZone(now, location.timeZone)
  const date = input.date ?? today
  const [schedule, attendance, planning] = await Promise.all([
    listDashboardSchedule(input.organizationId, location, date),
    listDashboardAttendance(input.organizationId, location, date, now),
    listDashboardPlanning(input.organizationId, location.id, today),
  ])
  const team = buildDashboardTeam({
    schedule,
    attendance,
    location,
    now,
    isToday: date === today,
  })
  const employees = new Map<string, ManagerClockEmployee>()
  const openEntries = new Map(
    attendance
      .filter((entry) => !entry.clocked_out_at)
      .map((entry) => [entry.employee_id, entry])
  )
  for (const row of team) {
    const existing = employees.get(row.employeeId)
    const open = openEntries.get(row.employeeId)
    if (!existing)
      employees.set(row.employeeId, {
        id: row.employeeId,
        name: row.employeeName,
        locationId: location.id,
        locationName: location.name,
        email: null,
        isActive: row.isActive,
        openEntry: open
          ? {
              id: open.id,
              clockedInAt: open.clocked_in_at,
              scheduledEndAt: open.scheduled_end_at,
              source: open.source,
              status: open.status,
              isForgottenClockOutAlert: false,
            }
          : null,
      })
  }
  return {
    date,
    today,
    isToday: date === today,
    updatedAt: now.toISOString(),
    location,
    team,
    planning,
    clockEmployees: [...employees.values()],
  }
}

export { getManagerDashboardDay }
