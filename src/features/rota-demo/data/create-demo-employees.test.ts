import { describe, expect, it } from "vitest"

import { createDemoEmployees } from "./create-demo-employees"
import { standaloneDemoBoard } from "./standalone-demo-board"
import { demoEmployeeCountSchema } from "@/features/rota-demo/schemas/demo-settings-schema"

describe("demo roster", () => {
  it("generates 1,000 unique, repeatable identities with valid staff groups", () => {
    const employees = createDemoEmployees(1000)
    expect(new Set(employees.map((employee) => employee.id)).size).toBe(1000)
    expect(new Set(employees.map((employee) => employee.name)).size).toBe(1000)
    expect(createDemoEmployees(25)).toEqual(employees.slice(0, 25))
    const groups = new Set(
      standaloneDemoBoard.employeeGroups.map((group) => group.id)
    )
    expect(employees.every((employee) => groups.has(employee.groupId))).toBe(
      true
    )
    expect(createDemoEmployees(0)).toEqual([])
  })

  it("keeps the seed assignments valid with only the requested zones", () => {
    expect(standaloneDemoBoard.location.name).toBe("Harbour House")
    expect(standaloneDemoBoard.zones.map((zone) => zone.name)).toEqual([
      "Front",
      "Beer Garden",
      "Function",
    ])
    const zones = new Set(standaloneDemoBoard.zones.map((zone) => zone.id))
    const employees = new Set(
      standaloneDemoBoard.employees.map((employee) => employee.id)
    )
    const shifts = new Set(standaloneDemoBoard.shifts.map((shift) => shift.id))
    expect(
      standaloneDemoBoard.shifts.every((shift) => zones.has(shift.zoneId))
    ).toBe(true)
    expect(
      standaloneDemoBoard.assignments.every(
        (assignment) =>
          employees.has(assignment.employeeId) && shifts.has(assignment.shiftId)
      )
    ).toBe(true)
    expect(standaloneDemoBoard.meta.settings.notifyStaffOnPublish).toBe(false)
  })

  it.each(["", " ", -1, 1.5, "abc", 1001])(
    "rejects invalid counts: %s",
    (count) => {
      expect(demoEmployeeCountSchema.safeParse(count).success).toBe(false)
    }
  )

  it.each([0, "25", 1000])("accepts supported counts: %s", (count) => {
    expect(demoEmployeeCountSchema.parse(count)).toBe(Number(count))
  })
})
