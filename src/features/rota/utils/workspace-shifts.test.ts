import { describe, expect, it } from "vitest"

import type {
  WorkspaceLocation,
  WorkspaceShift,
} from "@/features/rota/types/workspace"
import {
  compareShiftsByTime,
  shiftsHaveMatchingTimes,
} from "@/features/rota/utils/workspace-shifts"

const location: WorkspaceLocation = {
  id: "location",
  name: "Location",
  closeTimeByDayId: {
    monday: "23:00",
  },
  closeTimeNextDayByDayId: {},
  estimatedCloseTime: "22:00",
  estimatedCloseTimeNextDay: false,
}

const baseShift: WorkspaceShift = {
  id: "base",
  dayId: "monday",
  zoneId: "bar",
  shiftType: "standard",
  startTime: "09:00",
  endTime: "17:00",
}

describe("shiftsHaveMatchingTimes", () => {
  it("matches shifts on the same day with the same start and finish", () => {
    expect(
      shiftsHaveMatchingTimes(baseShift, {
        ...baseShift,
        id: "duplicate",
        zoneId: "floor",
      }, location)
    ).toBe(true)
  })

  it("allows matching start times with different finishes", () => {
    expect(
      shiftsHaveMatchingTimes(baseShift, {
        ...baseShift,
        id: "same-start",
        endTime: "15:00",
      }, location)
    ).toBe(false)
  })

  it("allows matching finish times with different starts", () => {
    expect(
      shiftsHaveMatchingTimes(baseShift, {
        ...baseShift,
        id: "same-finish",
        startTime: "11:00",
      }, location)
    ).toBe(false)
  })

  it("allows the same shift times on different days", () => {
    expect(
      shiftsHaveMatchingTimes(baseShift, {
        ...baseShift,
        id: "different-day",
        dayId: "tuesday",
      }, location)
    ).toBe(false)
  })

  it("matches closing shifts against the resolved finish time", () => {
    expect(
      shiftsHaveMatchingTimes(
        {
          ...baseShift,
          endTime: "23:00",
        },
        {
          id: "closing",
          dayId: "monday",
          zoneId: "bar",
          shiftType: "closing",
          startTime: "09:00",
          endKind: "locationClose",
        },
        location
      )
    ).toBe(true)
  })
})

describe("compareShiftsByTime", () => {
  it("sorts by start time first and finish time second", () => {
    const shifts: WorkspaceShift[] = [
      {
        ...baseShift,
        id: "ten-to-twelve",
        startTime: "10:00",
        endTime: "12:00",
      },
      {
        ...baseShift,
        id: "nine-to-three",
        startTime: "09:00",
        endTime: "15:00",
      },
      {
        ...baseShift,
        id: "nine-to-two",
        startTime: "09:00",
        endTime: "14:00",
      },
    ]

    expect(
      shifts.sort((left, right) => compareShiftsByTime(left, right, location))
    ).toMatchObject([
      { id: "nine-to-two" },
      { id: "nine-to-three" },
      { id: "ten-to-twelve" },
    ])
  })
})
