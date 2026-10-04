import { beforeEach, describe, expect, it, vi } from "vitest"

import { getTimesheetPageData } from "@/features/timesheets/server/queries"
import {
  standaloneTimeEntry,
  timesheetEmployee,
  timesheetScope,
} from "@/features/timesheets/server/test-fixtures"
import { getTimesheetEntryRows } from "@/features/timesheets/utils/timesheet-entry-rows"

const { query, resolveAccess } = vi.hoisted(() => ({
  query: vi.fn(),
  resolveAccess: vi.fn(),
}))

vi.mock("@/lib/db", () => ({ getDatabase: () => ({ query }) }))
vi.mock("@/features/timesheets/server/access", () => ({
  resolveTimesheetAccess: resolveAccess,
}))
vi.mock("@/features/billing/server/entitlements", () => ({
  listLocationEntitlements: () => Promise.resolve([]),
}))

const input = {
  organizationId: "org-1",
  userId: "user-1",
  weekStart: "2026-06-01",
}

beforeEach(() => {
  vi.resetAllMocks()
  resolveAccess.mockResolvedValue(timesheetScope)
  query.mockImplementation((sql: string) => {
    if (sql.includes("from public.rotas"))
      throw new Error("A rota must not be required")
    return {
      rows:
        sql.includes("public.employees") &&
        !sql.includes("public.rotas") &&
        !sql.includes("public.time_entries")
          ? [timesheetEmployee]
          : [],
    }
  })
})

describe("weekly timesheets without a rota", () => {
  it.each(["2026-06-01", "2026-06-08"])(
    "provides seven empty days for personal and team timesheets in %s",
    async (weekStart) => {
      const data = await getTimesheetPageData({ ...input, weekStart })
      const teamDays = data.managerTimesheet?.employees[0]?.days ?? []

      expect(data.weekStart).toBe(weekStart)
      expect(data.employeeTimesheet.days).toHaveLength(7)
      expect(teamDays).toHaveLength(7)
      expect(getTimesheetEntryRows(teamDays)).toHaveLength(7)
      expect(teamDays.every((day) => day.entries.length === 0)).toBe(true)
      expect(data.managerTimesheet?.payableMinutes).toBe(0)
      expect(data.locations).toEqual(timesheetScope.locations)
    }
  )

  it("includes worked hours unlinked to a published shift in both views", async () => {
    query.mockImplementation((sql: string) => ({
      rows: sql.includes("from public.time_entries")
        ? [standaloneTimeEntry]
        : sql.includes("public.rotas")
          ? []
          : [timesheetEmployee],
    }))
    const data = await getTimesheetPageData(input)

    expect(data.employeeTimesheet.actualMinutes).toBe(480)
    expect(data.employeeTimesheet.scheduledMinutes).toBe(0)
    expect(data.managerTimesheet?.payableMinutes).toBe(480)
    expect(data.employeeTimesheet.days[0].entries[0].rotaId).toBeNull()
  })

  it("keeps employee reads limited to their own entries", async () => {
    resolveAccess.mockResolvedValue({ ...timesheetScope, canManage: false })
    const data = await getTimesheetPageData(input)

    expect(data.managerTimesheet).toBeNull()
    expect(data.employeeTimesheet.days).toHaveLength(7)
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("from public.time_entries"),
      [["location-1"], "2026-06-01", "org-1", "user-1", "Europe/London"]
    )
  })
})
