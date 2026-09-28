import { describe, expect, it } from "vitest"
import { roles } from "@/lib/auth/permissions"

describe("staff join approval permissions", () => {
  it("allows owners, admins, and managers to review requests", () => {
    for (const role of [roles.owner, roles.admin, roles.manager]) {
      expect(role.authorize({ teamMember: ["approve"] }).success).toBe(true)
    }
  })

  it("does not allow supervisors or employees to review requests", () => {
    for (const role of [roles.supervisor, roles.employee]) {
      expect(role.authorize({ teamMember: ["approve"] }).success).toBe(false)
    }
  })
})
