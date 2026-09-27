import { describe, expect, it } from "vitest"

import type {
  ScheduledShiftRow,
  TimeEntryRow,
} from "@/features/timesheets/server/row-types"
import { buildTimesheetPage } from "@/features/timesheets/server/build-timesheet"
import { getTimesheetWeek } from "@/features/timesheets/utils/timesheet-time"
import { getEntryScheduleLabel } from "@/features/timesheets/utils/timesheet-view"

const scheduledShift: ScheduledShiftRow = {
  day_date: "2026-06-01",
  employee_id: "employee-1",
  employee_name: "Sam",
  employee_payroll_id: null,
  end_kind: null,
  end_time: "23:00:00",
  id: "shift-1",
  location_id: "location-1",
  location_name: "Main Bar",
  rota_id: "rota-1",
  rota_week_start: "2026-06-01",
  shift_type: "standard",
  split_second_end_time: null,
  split_second_start_time: null,
  start_time: "21:00:00",
  time_zone: "Europe/London",
  zone_name_snapshot: "Bar",
}

const timeEntry: TimeEntryRow = {
  clocked_in_at: "2026-06-01T20:00:00Z",
  clocked_out_at: "2026-06-01T22:00:00Z",
  employee_id: "employee-1",
  employee_name: "Sam",
  employee_payroll_id: null,
  id: "entry-1",
  location_id: "location-1",
  location_name: "Main Bar",
  notes: null,
  payable_end_at: null,
  payable_start_at: null,
  published_day_date: "2026-06-01",
  published_end_kind: null,
  published_end_time: "23:00:00",
  published_shift_type: "standard",
  published_split_second_end_time: null,
  published_split_second_start_time: null,
  published_start_time: "21:00:00",
  rota_published_shift_id: "shift-1",
  rota_id: "rota-1",
  rota_week_start: "2026-06-01",
  scheduled_end_at: "2026-06-01T23:00:00Z",
  scheduled_start_at: "2026-06-01T21:00:00Z",
  shift_segment: "full",
  source: "employee_nfc",
  status: "closed",
  time_zone: "Europe/London",
  zone_name: "Bar",
}

describe("timesheet schedule labels", () => {
  it("shows a published 21:00 shift at 21:00 in personal and team views", () => {
    expectSchedules([], [scheduledShift], "21:00 - 23:00")
  })

  it("uses the published wall time for an existing clocked entry", () => {
    expectSchedules([timeEntry], [scheduledShift], "21:00 - 23:00")
  })

  it("shows the correct half of a split shift", () => {
    expectSchedules(
      [
        {
          ...timeEntry,
          published_end_time: "14:00:00",
          published_shift_type: "split",
          published_split_second_end_time: "23:00:00",
          published_split_second_start_time: "21:00:00",
          shift_segment: "split_second",
        },
      ],
      [],
      "21:00 - 23:00"
    )
  })
})

function expectSchedules(
  entries: Array<TimeEntryRow>,
  scheduledShifts: Array<ScheduledShiftRow>,
  expected: string
) {
  const timesheets = buildTimesheetPage({
    employeeIds: ["employee-1"],
    employeeName: "Sam",
    employees: [
      {
        employee_id: "employee-1",
        employee_name: "Sam",
        employee_payroll_id: null,
        location_name: "Main Bar",
      },
    ],
    entries,
    now: new Date("2026-06-02T12:00:00Z"),
    scheduledShifts,
    week: getTimesheetWeek("2026-06-01"),
  })

  const personalEntry = timesheets.employeeTimesheet.days
    .flatMap((day) => day.entries)
    .at(0)
  const teamEntry = timesheets.managerTimesheet.employees[0]?.days
    .flatMap((day) => day.entries)
    .at(0)

  expect(getEntryScheduleLabel(personalEntry ?? null)).toBe(expected)
  expect(getEntryScheduleLabel(teamEntry ?? null)).toBe(expected)
}
