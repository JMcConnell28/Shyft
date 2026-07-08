import { describe, expect, it } from "vitest"

import type {
  WorkspaceAssignment,
  WorkspaceDay,
  WorkspaceEmployee,
  WorkspaceLocation,
  WorkspaceShift,
} from "@/features/rota/types/workspace"
import { buildBudgetInsights } from "@/features/rota/utils/budget-insights"
import {
  getScheduledCostSummaries,
  getScheduledShiftCostSummaries,
  getScheduledZoneCostSummaries,
} from "@/features/rota/utils/workspace-budget"

const days: Array<WorkspaceDay> = [
  {
    id: "monday",
    isoDate: "2026-06-08",
    shortLabel: "Mon",
    dayNumber: "8",
    monthLabel: "Jun",
  },
  {
    id: "tuesday",
    isoDate: "2026-06-09",
    shortLabel: "Tue",
    dayNumber: "9",
    monthLabel: "Jun",
  },
]

const location: WorkspaceLocation = {
  id: "location",
  name: "Location",
  closeTimeByDayId: {},
  closeTimeNextDayByDayId: {},
  estimatedCloseTime: "23:00",
  estimatedCloseTimeNextDay: false,
}
const zones = [
  { id: "bar", name: "Bar" },
  { id: "floor", name: "Floor" },
]

const shifts: Array<WorkspaceShift> = [
  {
    id: "monday-shift",
    dayId: "monday",
    zoneId: "bar",
    shiftType: "standard",
    startTime: "09:00",
    endTime: "10:00",
  },
  {
    id: "tuesday-shift",
    dayId: "tuesday",
    zoneId: "floor",
    shiftType: "standard",
    startTime: "09:00",
    endTime: "10:00",
  },
]

const employees: Array<WorkspaceEmployee> = [
  {
    id: "hourly",
    name: "Hourly employee",
    groupId: "team",
    groupColor: "slate",
    weeklyHours: 0,
    compensation: { type: "hourly", hourlyRatePence: 1000 },
  },
  {
    id: "salary",
    name: "Salary employee",
    groupId: "team",
    groupColor: "slate",
    weeklyHours: 0,
    compensation: { type: "salary", weeklySalaryPence: 20000 },
  },
]

const assignments: Array<WorkspaceAssignment> = [
  { id: "hourly-monday", employeeId: "hourly", shiftId: "monday-shift" },
  { id: "salary-monday", employeeId: "salary", shiftId: "monday-shift" },
  { id: "salary-tuesday", employeeId: "salary", shiftId: "tuesday-shift" },
]

const shiftsById = Object.fromEntries(shifts.map((shift) => [shift.id, shift]))
const employeesById = Object.fromEntries(
  employees.map((employee) => [employee.id, employee])
)
const assignmentsById = Object.fromEntries(
  assignments.map((assignment) => [assignment.id, assignment])
)
const assignmentIdsByShiftId = {
  "monday-shift": ["hourly-monday", "salary-monday"],
  "tuesday-shift": ["salary-tuesday"],
}
const allShiftIdsByDayId = {
  monday: ["monday-shift"],
  tuesday: ["tuesday-shift"],
}

describe("getScheduledCostSummaries", () => {
  it("combines hourly cost with a weekly salary counted once", () => {
    const summaries = getScheduledCostSummaries({
      assignmentIdsByShiftId,
      assignmentsById,
      days,
      employeesById,
      location,
      shiftIdsByDayId: allShiftIdsByDayId,
      shiftsById,
    })

    expect(summaries.map((summary) => summary.totalCost)).toEqual([110, 100])
    expect(summaries.reduce((sum, summary) => sum + summary.totalCost, 0)).toBe(
      210
    )
  })

  it("allocates salary cost proportionally when a zone is filtered", () => {
    const summaries = getScheduledCostSummaries({
      allShiftIdsByDayId,
      assignmentIdsByShiftId,
      assignmentsById,
      days,
      employeesById,
      location,
      shiftIdsByDayId: { monday: ["monday-shift"], tuesday: [] },
      shiftsById,
    })

    expect(summaries.map((summary) => summary.totalCost)).toEqual([110, 0])
  })
})

describe("getScheduledZoneCostSummaries", () => {
  it("groups scheduled cost by zone", () => {
    const summaries = getScheduledZoneCostSummaries({
      assignmentIdsByShiftId,
      assignmentsById,
      days,
      employeesById,
      location,
      shiftIdsByDayId: allShiftIdsByDayId,
      shiftsById,
      zones,
    })

    expect(summaries.map((summary) => summary.totalCost)).toEqual([110, 100])
    expect(summaries.map((summary) => summary.zoneName)).toEqual([
      "Bar",
      "Floor",
    ])
  })
})

describe("buildBudgetInsights", () => {
  it("flags over-budget rotas and creates suggestions", () => {
    const daySummaries = getScheduledCostSummaries({
      assignmentIdsByShiftId,
      assignmentsById,
      days,
      employeesById,
      location,
      shiftIdsByDayId: allShiftIdsByDayId,
      shiftsById,
    })
    const zoneSummaries = getScheduledZoneCostSummaries({
      assignmentIdsByShiftId,
      assignmentsById,
      days,
      employeesById,
      location,
      shiftIdsByDayId: allShiftIdsByDayId,
      shiftsById,
      zones,
    })
    const shiftSummaries = getScheduledShiftCostSummaries({
      assignmentIdsByShiftId,
      assignmentsById,
      days,
      employeesById,
      location,
      shiftIdsByDayId: allShiftIdsByDayId,
      shiftsById,
      zones,
    })

    const insights = buildBudgetInsights({
      budgetPence: 10000,
      days,
      daySummaries,
      shiftSummaries,
      zoneSummaries,
    })

    expect(insights.isOverBudget).toBe(true)
    expect(insights.overBudgetAmount).toBe(110)
    expect(insights.suggestions.map((suggestion) => suggestion.id)).toContain(
      "over-budget"
    )
    expect(insights.dayBreakdown[0]?.targetCost).toBeCloseTo(66.67)
  })
})
