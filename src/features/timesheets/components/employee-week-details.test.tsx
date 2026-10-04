import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { EmployeeWeekDetails } from "@/features/timesheets/components/employee-week-details"
import { buildTimesheetPage } from "@/features/timesheets/server/build-timesheet"
import { timesheetEmployee } from "@/features/timesheets/server/test-fixtures"
import { getTimesheetWeek } from "@/features/timesheets/utils/timesheet-time"

vi.mock("@/features/timesheets/hooks/use-viewer-time-zone", () => ({
  useViewerTimeZone: () => "Europe/London",
}))

describe("empty team timesheet", () => {
  it("renders all seven days without a rota or clock records", () => {
    const { managerTimesheet } = buildTimesheetPage({
      employeeIds: ["employee-1"],
      employeeName: "Sam",
      employees: [timesheetEmployee],
      entries: [],
      scheduledShifts: [],
      now: new Date("2026-06-01T12:00:00Z"),
      week: getTimesheetWeek("2026-06-01"),
    })
    const markup = renderToStaticMarkup(
      createElement(EmployeeWeekDetails, {
        employee: managerTimesheet.employees[0],
        canEditEntry: () => true,
        onEdit: vi.fn(),
      })
    )

    for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
      expect(markup).toContain(day)
    }
    expect(markup.match(/No entry/g)).toHaveLength(7)
    expect(markup.match(/disabled=""/g)).toHaveLength(7)
  })
})
