import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getSageTimesheetExportData } from "@/features/timesheets/server/sage-export"
import {
  standaloneTimeEntry,
  timesheetScope,
} from "@/features/timesheets/server/test-fixtures"

const { query, resolveAccess } = vi.hoisted(() => ({
  query: vi.fn(),
  resolveAccess: vi.fn(),
}))
vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("@/features/timesheets/server/access", () => ({
  resolveTimesheetAccess: resolveAccess,
}))

const input = {
  organizationId: "org-1",
  userId: "user-1",
  exportLocationId: "location-1",
  weekStart: "2026-06-01",
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-06-10T12:00:00Z"))
  resolveAccess.mockResolvedValue(timesheetScope)
  query.mockImplementation((sql: string) => {
    if (sql.includes("from public.rotas"))
      throw new Error("A rota must not be required")
    return {
      rows: sql.includes("from public.locations")
        ? [{ id: "location-1", name: "Main Bar", slug: "main-bar" }]
        : sql.includes("from public.time_entries")
          ? [standaloneTimeEntry]
          : [],
    }
  })
})

afterEach(() => vi.useRealTimers())

describe("Sage export by timesheet week", () => {
  it("exports payable hours without a drafted or published rota", async () => {
    const result = await getSageTimesheetExportData(input)
    expect(result.fileName).toBe("sage-payroll-main-bar-2026-06-01.csv")
    expect(result.rows).toEqual([
      expect.objectContaining({ employeeReference: "42", units: "8.00" }),
    ])
  })

  it("normalizes the selected date to its week", async () => {
    await getSageTimesheetExportData({ ...input, weekStart: "2026-06-07" })
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("from public.time_entries"),
      [["location-1"], "2026-06-01", "org-1", null, "Europe/London"]
    )
  })

  it.each(["2026-06-08", "2026-06-15"])(
    "rejects an incomplete week: %s",
    async (weekStart) => {
      await expect(
        getSageTimesheetExportData({ ...input, weekStart })
      ).rejects.toThrow("completed timesheet weeks")
      expect(query).not.toHaveBeenCalled()
    }
  )

  it("rejects employee access", async () => {
    resolveAccess.mockResolvedValue({ ...timesheetScope, canManage: false })
    await expect(getSageTimesheetExportData(input)).rejects.toThrow(
      "permission"
    )
    expect(query).not.toHaveBeenCalled()
  })

  it("rejects locations outside the manager's scope", async () => {
    await expect(
      getSageTimesheetExportData({
        ...input,
        exportLocationId: "other-location",
      })
    ).rejects.toThrow("location you can manage")
    expect(query).not.toHaveBeenCalled()
  })

  it.each(["open", "requires_review"] as const)(
    "requires resolving %s entries even without a rota",
    async (status) => {
      query
        .mockResolvedValueOnce({
          rows: [{ id: "location-1", name: "Main Bar", slug: null }],
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...standaloneTimeEntry, status }] })
      await expect(getSageTimesheetExportData(input)).rejects.toThrow(
        "Resolve open or review timesheets"
      )
    }
  )

  it("still requires payroll IDs for payable hours", async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ id: "location-1", name: "Main Bar", slug: null }],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ ...standaloneTimeEntry, employee_payroll_id: null }],
      })
    await expect(getSageTimesheetExportData(input)).rejects.toThrow(
      "Add Sage payroll IDs"
    )
  })
})
