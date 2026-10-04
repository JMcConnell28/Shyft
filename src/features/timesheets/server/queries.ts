import type { TimesheetEmployeeRow } from "@/features/timesheets/server/row-types"
import type {
  TimesheetPageData,
  TimesheetScopeInput,
} from "@/features/timesheets/types"
import {
  listTimesheetEmployees,
  listUserEmployees,
} from "@/features/timesheets/server/employees"
import {
  listScheduledShifts,
  listTimeEntries,
} from "@/features/timesheets/server/week-records"
import { buildTimesheetPage } from "@/features/timesheets/server/build-timesheet"
import { listLocationEntitlements } from "@/features/billing/server/entitlements"
import { resolveTimesheetAccess } from "@/features/timesheets/server/access"
import { getTimesheetWeek } from "@/features/timesheets/utils/timesheet-time"

async function getTimesheetPageData(
  input: TimesheetScopeInput
): Promise<TimesheetPageData> {
  const scope = await resolveTimesheetAccess(input)
  const week = getTimesheetWeek(input.weekStart)

  if (scope.locationIds.length === 0) {
    return {
      canManage: false,
      writableLocationIds: [],
      employeeTimesheet: getEmptyEmployeeTimesheet(week.days),
      locations: [],
      managerTimesheet: null,
      weekEnd: week.weekEnd,
      weekLabel: week.weekLabel,
      weekStart: week.weekStart,
    }
  }

  const [
    employeeRows,
    managerEmployeeRows,
    scheduledRows,
    entryRows,
    entitlements,
  ] = await Promise.all([
    listUserEmployees({
      locationIds: scope.locationIds,
      organizationId: scope.organizationId,
      userId: scope.userId,
    }),
    scope.canManage
      ? listTimesheetEmployees(scope.locationIds)
      : Promise.resolve<Array<TimesheetEmployeeRow>>([]),
    listScheduledShifts({
      employeeUserId: scope.canManage ? null : scope.userId,
      locationIds: scope.locationIds,
      organizationId: scope.organizationId,
      weekStart: week.weekStart,
    }),
    listTimeEntries({
      employeeUserId: scope.canManage ? null : scope.userId,
      locationIds: scope.locationIds,
      organizationId: scope.organizationId,
      weekStart: week.weekStart,
    }),
    scope.canManage
      ? listLocationEntitlements(scope.locationIds)
      : Promise.resolve([]),
  ])

  const employeeIds = employeeRows.map((employee) => employee.employee_id)
  const employees = scope.canManage ? managerEmployeeRows : employeeRows
  const shaped = buildTimesheetPage({
    employeeIds,
    employeeName: employeeRows[0]?.employee_name ?? "Your timesheet",
    employees,
    entries: entryRows,
    now: new Date(),
    scheduledShifts: scheduledRows,
    week,
  })

  return {
    canManage: scope.canManage,
    writableLocationIds: entitlements
      .filter((entitlement) => entitlement.canWrite)
      .map((entitlement) => entitlement.locationId),
    employeeTimesheet: shaped.employeeTimesheet,
    locations: scope.locations,
    managerTimesheet: scope.canManage ? shaped.managerTimesheet : null,
    weekEnd: week.weekEnd,
    weekLabel: week.weekLabel,
    weekStart: week.weekStart,
  }
}

function getEmptyEmployeeTimesheet(
  days: ReturnType<typeof getTimesheetWeek>["days"]
) {
  return {
    actualMinutes: 0,
    days: days.map((day) => ({
      ...day,
      actualMinutes: 0,
      entries: [],
      openEntryCount: 0,
      payableMinutes: 0,
      reviewCount: 0,
      scheduledMinutes: 0,
    })),
    employeeId: null,
    employeeName: "Your timesheet",
    openEntryCount: 0,
    payableMinutes: 0,
    reviewCount: 0,
    scheduledMinutes: 0,
  }
}

export { getTimesheetPageData }
