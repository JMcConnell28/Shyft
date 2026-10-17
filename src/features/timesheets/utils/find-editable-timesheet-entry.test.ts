import { describe, expect, it } from "vitest"
import { findEditableTimesheetEntry } from "./find-editable-timesheet-entry"
import { timesheetSearchSchema } from "@/features/timesheets/schemas/timesheet-search-schema"
import { buildTimesheetPage } from "@/features/timesheets/server/build-timesheet"
import {
  standaloneTimeEntry,
  timesheetEmployee,
} from "@/features/timesheets/server/test-fixtures"
import { getTimesheetWeek } from "@/features/timesheets/utils/timesheet-time"

const entryId = "60000000-0000-4000-8000-000000000001"
const { managerTimesheet } = buildTimesheetPage({
  employeeIds: ["employee-1"],
  employeeName: "Sam",
  employees: [timesheetEmployee],
  entries: [{ ...standaloneTimeEntry, id: entryId }],
  scheduledShifts: [],
  now: new Date("2026-06-01T17:00:00Z"),
  week: getTimesheetWeek("2026-06-01"),
})

describe("direct timesheet review links", () => {
  it("finds the exact permitted entry from the loaded week", () => {
    expect(
      findEditableTimesheetEntry(managerTimesheet, entryId, ["location-1"])?.id
    ).toBe(entryId)
  })
  it("does not select entries outside writable locations", () => {
    expect(
      findEditableTimesheetEntry(managerTimesheet, entryId, ["other-location"])
    ).toBeNull()
  })
  it("does not fetch or expose unknown entries", () => {
    expect(
      findEditableTimesheetEntry(managerTimesheet, "unknown", ["location-1"])
    ).toBeNull()
  })
  it("validates direct-link identifiers and dates", () => {
    expect(
      timesheetSearchSchema.parse({ entryId, weekStart: "2026-06-01" })
    ).toEqual({ entryId, weekStart: "2026-06-01" })
    expect(
      timesheetSearchSchema.parse({
        entryId: "forged",
        weekStart: "2026-02-30",
      })
    ).toEqual({ entryId: undefined, weekStart: undefined })
  })
})
