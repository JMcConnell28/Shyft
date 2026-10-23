// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import type * as React from "react"

import { createDemoEmployees } from "@/features/rota-demo/data/create-demo-employees"
import { standaloneDemoBoard } from "@/features/rota-demo/data/standalone-demo-board"
import { useRotaWorkspaceState } from "@/features/rota/hooks/use-rota-workspace-state"

vi.mock("react", async () => {
  const { createRequire } = await import("node:module")
  const react: typeof React = createRequire(import.meta.url)("react")
  return { ...react, default: react }
})
vi.mock("@/features/rota/hooks/use-touch-input", () => ({
  useTouchInput: () => false,
}))
afterEach(cleanup)

describe("demo roster changes", () => {
  it("preserves notes and shift edits, hiding and restoring assignments with staff counts", async () => {
    const employees = createDemoEmployees(24)
    const { result, rerender } = renderHook(
      ({ roster }) =>
        useRotaWorkspaceState({
          boardData: standaloneDemoBoard,
          mode: "demo",
          demoEmployees: roster,
        }),
      { initialProps: { roster: employees } }
    )
    const extraEmployee = employees[15]
    await act(async () => {
      result.current.setMetaNote("Function room setup at 17:00")
      await result.current.createShift({
        dayId: "monday",
        zoneId: "function",
        shiftType: "standard",
        startTime: "19:00",
        endTime: "23:00",
      })
      await result.current.assignEmployeeToShift(
        extraEmployee.id,
        "mon-manager"
      )
    })
    const shiftCount = Object.keys(result.current.shiftsById).length
    expect(
      Object.values(result.current.assignmentsById).some(
        (assignment) => assignment.employeeId === extraEmployee.id
      )
    ).toBe(true)
    rerender({ roster: createDemoEmployees(0) })
    expect(result.current.assignmentsById).toEqual({})
    expect(result.current.employeesById).toEqual({})
    expect(result.current.meta.note).toBe("Function room setup at 17:00")
    expect(Object.keys(result.current.shiftsById)).toHaveLength(shiftCount)
    rerender({ roster: createDemoEmployees(24) })
    expect(
      Object.values(result.current.assignmentsById).some(
        (assignment) => assignment.employeeId === extraEmployee.id
      )
    ).toBe(true)
  })

  it("ignores demo roster overrides in the real workspace", () => {
    const { result } = renderHook(() =>
      useRotaWorkspaceState({
        boardData: standaloneDemoBoard,
        mode: "default",
        demoEmployees: [],
      })
    )
    expect(Object.keys(result.current.employeesById)).toHaveLength(
      standaloneDemoBoard.employees.length
    )
    expect(Object.keys(result.current.assignmentsById)).toHaveLength(
      standaloneDemoBoard.assignments.length
    )
  })
})
