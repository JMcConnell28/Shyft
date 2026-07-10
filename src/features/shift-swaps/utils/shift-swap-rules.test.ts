import { describe, expect, it } from "vitest"

import {
  getShiftSwapCutoffAt,
  hasCompatibleStaffGroup,
  isActiveShiftSwapStatus,
  isPastShiftSwapCutoff,
  shiftsOverlap,
} from "@/features/shift-swaps/utils/shift-swap-rules"

describe("shift swap rules", () => {
  it("uses a 2 hour cutoff before shift start", () => {
    const startsAt = new Date(Date.UTC(2026, 5, 22, 12, 0, 0))
    const cutoffAt = getShiftSwapCutoffAt(startsAt)

    expect(cutoffAt.toISOString()).toBe("2026-06-22T10:00:00.000Z")
    expect(
      isPastShiftSwapCutoff(cutoffAt, new Date(Date.UTC(2026, 5, 22, 9, 59, 0)))
    ).toBe(false)
    expect(
      isPastShiftSwapCutoff(cutoffAt, new Date(Date.UTC(2026, 5, 22, 10, 0, 0)))
    ).toBe(true)
  })

  it("matches staff groups including ungrouped employees", () => {
    expect(hasCompatibleStaffGroup("front", "front")).toBe(true)
    expect(hasCompatibleStaffGroup(null, null)).toBe(true)
    expect(hasCompatibleStaffGroup("front", "kitchen")).toBe(false)
  })

  it("identifies active request statuses", () => {
    expect(isActiveShiftSwapStatus("open")).toBe(true)
    expect(isActiveShiftSwapStatus("approved")).toBe(false)
  })

  it("detects overlapping standard shifts", () => {
    expect(
      shiftsOverlap(
        {
          date: "2026-06-22",
          shiftType: "standard",
          startTime: "09:00",
          endTime: "13:00",
          endKind: null,
          splitSecondStartTime: null,
          splitSecondEndTime: null,
        },
        {
          date: "2026-06-22",
          shiftType: "standard",
          startTime: "12:00",
          endTime: "16:00",
          endKind: null,
          splitSecondStartTime: null,
          splitSecondEndTime: null,
        }
      )
    ).toBe(true)
  })

  it("does not treat split-shift gaps as overlapping", () => {
    expect(
      shiftsOverlap(
        {
          date: "2026-06-22",
          shiftType: "split",
          startTime: "09:00",
          endTime: "11:00",
          splitSecondStartTime: "15:00",
          splitSecondEndTime: "18:00",
          endKind: null,
        },
        {
          date: "2026-06-22",
          shiftType: "standard",
          startTime: "12:00",
          endTime: "14:00",
          endKind: null,
          splitSecondStartTime: null,
          splitSecondEndTime: null,
        }
      )
    ).toBe(false)
  })
})
