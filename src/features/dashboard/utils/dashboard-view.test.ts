import { describe, expect, it } from "vitest"
import { canViewManagerDashboard, getDashboardView } from "./dashboard-view"
import { dashboardSearchSchema } from "@/features/dashboard/schemas/dashboard-search"
import { getOrgCapabilitiesForRole } from "@/lib/auth/workspace-capabilities"

describe("dashboard view selection", () => {
  it.each(["owner", "admin", "manager", "supervisor"] as const)(
    "lets a %s open either dashboard and keeps management as the default",
    (role) => {
      const capabilities = getOrgCapabilitiesForRole(role)
      expect(canViewManagerDashboard(capabilities)).toBe(true)
      expect(getDashboardView(capabilities)).toBe("manager")
      expect(getDashboardView(capabilities, "manager")).toBe("manager")
      expect(getDashboardView(capabilities, "personal")).toBe("personal")
    }
  )

  it.each(["employee", null] as const)(
    "keeps %s on the personal dashboard even with a management URL",
    (role) => {
      const capabilities = getOrgCapabilitiesForRole(role)
      expect(canViewManagerDashboard(capabilities)).toBe(false)
      expect(getDashboardView(capabilities)).toBe("personal")
      expect(getDashboardView(capabilities, "manager")).toBe("personal")
    }
  )

  it("preserves manager filters when parsing a personal dashboard URL", () => {
    const search = {
      view: "personal",
      location: "f64d43d7-c0e7-4393-892a-383b13430298",
      date: "2026-10-18",
    }
    expect(dashboardSearchSchema.parse(search)).toEqual(search)
  })

  it("falls back to the role default for invalid URL views", () => {
    for (const view of ["unknown", ["manager"], { view: "manager" }]) {
      const search = dashboardSearchSchema.parse({ view })
      expect(search.view).toBeUndefined()
      expect(
        getDashboardView(getOrgCapabilitiesForRole("manager"), search.view)
      ).toBe("manager")
    }
  })
})
