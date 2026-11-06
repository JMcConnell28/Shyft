import { describe, expect, it } from "vitest"
import { roles } from "@/lib/auth/permissions"

describe("staff join approval permissions", () => {
  it("allows only owners and admins to review requests", () => {
    for (const role of [roles.owner, roles.admin]) {
      expect(role.authorize({ teamMember: ["approve"] }).success).toBe(true)
    }
  })

  it("does not allow managers, supervisors or employees to review requests", () => {
    for (const role of [roles.manager, roles.supervisor, roles.employee]) {
      expect(role.authorize({ teamMember: ["approve"] }).success).toBe(false)
    }
  })
})
