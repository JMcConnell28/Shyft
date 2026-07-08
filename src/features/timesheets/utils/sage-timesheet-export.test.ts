import { describe, expect, it } from "vitest"

import type { TimesheetEntry } from "@/features/timesheets/types"
import {
  buildSageTimesheetExportData,
  getMissingPayrollEmployees,
  getUnresolvedEntryEmployees,
  serializeSageTimesheetExportCsv,
} from "@/features/timesheets/utils/sage-timesheet-export"

const baseEntry: TimesheetEntry = {
  id: "entry-1",
  actualMinutes: 450,
  clockedInAt: "2026-06-01T08:58:00.000Z",
  clockedOutAt: "2026-06-01T16:31:00.000Z",
  employeeId: "employee-1",
  employeeName: "Ada Lovelace",
  employeePayrollId: "42",
  locationId: "location-1",
  locationName: "Harbour House",
  notes: null,
  payableEndAt: "2026-06-01T16:30:00.000Z",
  payableMinutes: 450,
  payableStartAt: "2026-06-01T09:00:00.000Z",
  publishedShiftId: "shift-1",
  rotaId: "rota-12345678",
  rotaLabel: "Harbour House rota, 1 Jun",
  scheduledEndAt: "2026-06-01T16:30:00.000Z",
  scheduledMinutes: 450,
  scheduledStartAt: "2026-06-01T09:00:00.000Z",
  shiftSegment: "full",
  source: "employee_nfc",
  status: "closed",
  zoneName: "Bar",
}

describe("buildSageTimesheetExportData", () => {
  it("groups payable minutes into Sage payroll rows by employee", () => {
    const exportData = buildSageTimesheetExportData({
      entries: [
        baseEntry,
        {
          ...baseEntry,
          id: "entry-2",
          payableMinutes: 90,
          shiftSegment: "split_second",
        },
        {
          ...baseEntry,
          employeeId: "employee-2",
          employeeName: "Grace Hopper",
          employeePayrollId: "7",
          payableMinutes: 120,
        },
        {
          ...baseEntry,
          employeeId: "employee-3",
          employeeName: "Katherine Johnson",
          employeePayrollId: null,
          payableMinutes: 0,
          source: "scheduled",
          status: "scheduled",
        },
      ],
      locationName: "Harbour House",
      locationSlug: "harbour-house",
      rotaId: "rota-12345678",
      weekStart: "2026-06-01",
    })

    expect(exportData.fileName).toBe(
      "sage-payroll-harbour-house-2026-06-01-rota-123.csv"
    )
    expect(exportData.missingPayrollEmployees).toEqual([])
    expect(exportData.rows).toEqual([
      {
        amount: "",
        employeeName: "Ada Lovelace",
        employeeReference: "42",
        location: "Harbour House",
        notes: "",
        payElement: "Basic Hours",
        rate: "",
        units: "9.00",
        weekEnd: "07/06/2026",
        weekStart: "01/06/2026",
      },
      {
        amount: "",
        employeeName: "Grace Hopper",
        employeeReference: "7",
        location: "Harbour House",
        notes: "",
        payElement: "Basic Hours",
        rate: "",
        units: "2.00",
        weekEnd: "07/06/2026",
        weekStart: "01/06/2026",
      },
    ])
  })

  it("reports missing payroll IDs and unresolved entries", () => {
    const entries = [
      {
        ...baseEntry,
        employeeName: "Mary Jackson",
        employeePayrollId: null,
      },
      {
        ...baseEntry,
        employeeName: "Katherine Johnson",
        status: "requires_review" as const,
      },
    ]

    expect(getMissingPayrollEmployees(entries)).toEqual(["Mary Jackson"])
    expect(getUnresolvedEntryEmployees(entries)).toEqual(["Katherine Johnson"])
  })
})

describe("serializeSageTimesheetExportCsv", () => {
  it("includes Sage payroll headers and formatted row values", () => {
    const csv = serializeSageTimesheetExportCsv({
      fileName: "sage-payroll.csv",
      missingPayrollEmployees: [],
      rows: [
        {
          amount: "",
          employeeName: "Ada Lovelace",
          employeeReference: "42",
          location: "Harbour House",
          notes: 'Manager said "approved"',
          payElement: "Basic Hours",
          rate: "",
          units: "7.50",
          weekEnd: "07/06/2026",
          weekStart: "01/06/2026",
        },
      ],
    })

    expect(csv).toContain('"Employee Reference","Employee Name","Pay Element"')
    expect(csv).toContain('"42","Ada Lovelace","Basic Hours","7.50"')
    expect(csv).toContain('"Manager said ""approved"""')
  })
})
