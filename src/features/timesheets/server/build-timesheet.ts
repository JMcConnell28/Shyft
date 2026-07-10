import { mapEntryRows } from "@/features/timesheets/server/entry-mapping"
import type {
  ScheduledShiftRow,
  TimeEntryRow,
  TimesheetEmployeeRow,
} from "@/features/timesheets/server/row-types"
import type {
  EmployeeTimesheet,
  ManagerTimesheet,
  ManagerTimesheetEmployee,
  TimesheetDay,
  TimesheetEntry,
  TimesheetTotals,
} from "@/features/timesheets/types"
import {
  getDateKey,
  type TimesheetWeek,
} from "@/features/timesheets/utils/timesheet-time"

function buildTimesheetPage(input: {
  employeeIds: string[]
  employeeName: string
  employees: TimesheetEmployeeRow[]
  entries: TimeEntryRow[]
  now: Date
  scheduledShifts: ScheduledShiftRow[]
  week: TimesheetWeek
}) {
  const entries = mapEntryRows({
    entries: input.entries,
    now: input.now,
    scheduledShifts: input.scheduledShifts,
  })

  return {
    employeeTimesheet: buildEmployeeTimesheet({
      employeeIds: input.employeeIds,
      employeeName: input.employeeName,
      entries,
      week: input.week,
    }),
    managerTimesheet: buildManagerTimesheet({
      employees: input.employees,
      entries,
      week: input.week,
    }),
  }
}

function buildEmployeeTimesheet(input: {
  employeeIds: string[]
  employeeName: string
  entries: TimesheetEntry[]
  week: TimesheetWeek
}): EmployeeTimesheet {
  const entries = input.entries.filter((entry) =>
    input.employeeIds.includes(entry.employeeId),
  )
  const days = buildDays(input.week, entries)

  return {
    ...getTotals(days),
    employeeId: input.employeeIds[0] ?? null,
    employeeName: input.employeeName,
    days,
  }
}

function buildManagerTimesheet(input: {
  employees: TimesheetEmployeeRow[]
  entries: TimesheetEntry[]
  week: TimesheetWeek
}): ManagerTimesheet {
  const employees = input.employees.map((employee) =>
    buildManagerEmployeeTimesheet({
      employee,
      entries: input.entries.filter(
        (entry) => entry.employeeId === employee.employee_id,
      ),
      week: input.week,
    }),
  )

  return {
    ...getTotals(employees),
    employees,
  }
}

function buildManagerEmployeeTimesheet(input: {
  employee: TimesheetEmployeeRow
  entries: TimesheetEntry[]
  week: TimesheetWeek
}): ManagerTimesheetEmployee {
  const days = buildDays(input.week, input.entries)
  const locations = input.entries.map((entry) => entry.locationName)

  return {
    ...getTotals(days),
    employeeId: input.employee.employee_id,
    employeeName: input.employee.employee_name,
    locations: Array.from(new Set([input.employee.location_name, ...locations])),
    days,
  }
}

function buildDays(week: TimesheetWeek, entries: TimesheetEntry[]) {
  return week.days.map<TimesheetDay>((day) => {
    const dayEntries = entries.filter((entry) => getEntryDate(entry) === day.date)

    return {
      ...day,
      ...getTotals(dayEntries),
      entries: dayEntries,
    }
  })
}

function getTotals(
  items: Array<TimesheetEntry | TimesheetDay | ManagerTimesheetEmployee>,
): TimesheetTotals {
  return items.reduce<TimesheetTotals>(
    (totals, item) => {
      const openCount =
        "status" in item ? (item.status === "open" ? 1 : 0) : item.openEntryCount
      const reviewCount =
        "status" in item
          ? item.status === "requires_review"
            ? 1
            : 0
          : item.reviewCount

      return {
        actualMinutes: totals.actualMinutes + item.actualMinutes,
        openEntryCount: totals.openEntryCount + openCount,
        payableMinutes: totals.payableMinutes + item.payableMinutes,
        reviewCount: totals.reviewCount + reviewCount,
        scheduledMinutes: totals.scheduledMinutes + item.scheduledMinutes,
      }
    },
    {
      actualMinutes: 0,
      openEntryCount: 0,
      payableMinutes: 0,
      reviewCount: 0,
      scheduledMinutes: 0,
    },
  )
}

function getEntryDate(entry: TimesheetEntry) {
  return (
    getDateKey(entry.scheduledStartAt) ??
    getDateKey(entry.clockedInAt) ??
    getDateKey(entry.payableStartAt) ??
    ""
  )
}

export { buildTimesheetPage }
