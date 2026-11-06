import { describe, expect, it } from "vitest"
import { getOrgCapabilitiesForRole } from "./workspace-capabilities"
import { roles } from "./permissions"

describe("organization role boundaries", () => {
  it("lets supervisors make manual clock actions without team timesheet access", () => {
    expect(getOrgCapabilitiesForRole("supervisor")).toMatchObject({
      canManageTimeClock: true,
      canManageTimesheets: false,
      canManageRota: false,
    })
  })
  it.each(["owner", "admin", "manager"] as const)(
    "keeps %s team timesheet access",
    (role) => {
      expect(getOrgCapabilitiesForRole(role).canManageTimesheets).toBe(true)
    }
  )
  it.each(["supervisor", "employee", "member"] as const)(
    "does not grant %s team timesheet permission",
    (role) => {
      expect(roles[role].authorize({ timesheet: ["manage"] }).success).toBe(
        false
      )
    }
  )
})
