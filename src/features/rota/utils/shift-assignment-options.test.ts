import { describe, expect, it } from "vitest"
import type { WorkspaceShift } from "@/features/rota/types/workspace"
import {
  assignmentBoard,
  targetShift,
} from "@/features/rota/test/shift-assignment-fixture"
import { getAssignmentOverlapResult } from "@/features/rota/utils/assignment-overlap"
import { buildShiftAssignmentOptions } from "@/features/rota/utils/shift-assignment-options"

const input = {
  assignmentsById: Object.fromEntries(
    assignmentBoard.assignments.map((entry) => [entry.id, entry])
  ),
  days: assignmentBoard.days,
  location: assignmentBoard.location,
  shiftId: targetShift.id,
  shiftsById: Object.fromEntries(
    assignmentBoard.shifts.map((entry) => [entry.id, entry])
  ),
  employees: assignmentBoard.employees,
  employeeGroups: assignmentBoard.employeeGroups,
}

function reasonForShift(existing: WorkspaceShift, target = targetShift) {
  return buildShiftAssignmentOptions({
    ...input,
    shiftsById: { target, existing },
    assignmentsById: {
      conflict: { id: "conflict", employeeId: "ella", shiftId: "existing" },
    },
  }).find((option) => option.employee.id === "ella")?.disabledReason
}

describe("shift assignment eligibility", () => {
  it("lists all location employees with group labels and separate conflict reasons", () => {
    const options = buildShiftAssignmentOptions(input)
    expect(
      options.map(({ employee, groupName, disabledReason }) => [
        employee.name,
        groupName,
        disabledReason,
      ])
    ).toEqual([
      ["Ava", "Front of house", "Already assigned"],
      ["Ella", "Front of house", "Overlapping shift"],
      ["Leo", "Front of house", null],
      ["Remy", "Front of house", null],
    ])
  })

  it("allows adjacent shifts and matching times on another day", () => {
    expect(
      reasonForShift({ ...targetShift, startTime: "15:00", endTime: "18:00" })
    ).toBeNull()
    expect(reasonForShift({ ...targetShift, dayId: "tuesday" })).toBeNull()
  })

  it("blocks overnight conflicts on the next day", () => {
    expect(
      reasonForShift(
        { ...targetShift, startTime: "22:00", endTime: "02:00" },
        {
          ...targetShift,
          dayId: "tuesday",
          startTime: "01:00",
          endTime: "05:00",
        }
      )
    ).toBe("Overlapping shift")
  })

  it("resolves closing shifts using the location closing time", () => {
    expect(
      reasonForShift({
        id: "closing",
        dayId: "monday",
        zoneId: "bar",
        shiftType: "closing",
        startTime: "14:00",
        endKind: "locationClose",
      })
    ).toBe("Overlapping shift")
  })

  it("allows the gap in a split shift but blocks its second segment", () => {
    const split: WorkspaceShift = {
      id: "split",
      dayId: "monday",
      zoneId: "bar",
      shiftType: "split",
      segments: [
        { startTime: "09:00", endTime: "12:00" },
        { startTime: "16:00", endTime: "20:00" },
      ],
    }
    expect(
      reasonForShift(split, {
        ...targetShift,
        startTime: "12:00",
        endTime: "16:00",
      })
    ).toBeNull()
    expect(
      reasonForShift(split, {
        ...targetShift,
        startTime: "15:00",
        endTime: "17:00",
      })
    ).toBe("Overlapping shift")
  })

  it("ignores stale assignments and disables a deleted target", () => {
    expect(
      buildShiftAssignmentOptions({
        ...input,
        shiftsById: { target: targetShift },
      }).find((option) => option.employee.id === "ella")?.disabledReason
    ).toBeNull()
    expect(
      buildShiftAssignmentOptions({ ...input, shiftsById: {} }).every(
        (option) => option.disabledReason === "Shift no longer available"
      )
    ).toBe(true)
  })

  it("uses the same conflict check for mutations and excludes the assignment being moved", () => {
    const mutationInput = {
      ...input,
      employeeId: "ella",
      employeesById: Object.fromEntries(
        input.employees.map((entry) => [entry.id, entry])
      ),
      zones: assignmentBoard.zones,
    }
    expect(getAssignmentOverlapResult(mutationInput)?.status).toBe("overlap")
    expect(
      getAssignmentOverlapResult({
        ...mutationInput,
        excludeAssignmentId: "overlap",
      })
    ).toBeNull()
  })
})
