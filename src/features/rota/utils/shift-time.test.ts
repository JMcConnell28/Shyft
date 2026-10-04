import { describe, expect, it } from "vitest"
import type { WorkspaceSplitShift } from "@/features/rota/types/workspace"
import type { RotaTimeFormat } from "@/features/rota/schemas/time-format-schema"
import {
  buildShiftTimeValue,
  parseShiftTimeParts,
} from "@/features/rota/utils/shift-time"
import { formatShiftTime } from "@/features/rota/utils/format-shift-time"
import { getShiftDisplayLines } from "@/features/rota/utils/workspace-shifts"
import { targetShift } from "@/features/rota/test/shift-assignment-fixture"

describe("rota time formats", () => {
  it.each([
    ["00:00", "12:00 AM"],
    ["00:30", "12:30 AM"],
    ["09:15", "9:15 AM"],
    ["12:00", "12:00 PM"],
    ["12:45", "12:45 PM"],
    ["17:30", "5:30 PM"],
    ["23:45", "11:45 PM"],
  ])(
    "defaults %s to %s and preserves its 24-hour representation",
    (time, expected) => {
      expect(formatShiftTime(time)).toBe(expected)
      expect(formatShiftTime(time, "24h")).toBe(time)
    }
  )

  it.each<RotaTimeFormat>(["12h", "24h"])(
    "round-trips every selectable time in %s without changing its stored value",
    (format) => {
      for (let hour = 0; hour < 24; hour++) {
        for (const minute of ["00", "15", "30", "45"]) {
          const value = `${String(hour).padStart(2, "0")}:${minute}`
          expect(
            buildShiftTimeValue(parseShiftTimeParts(value, format), format)
          ).toBe(value)
        }
      }
    }
  )

  it("uses one format for standard, closing, overnight and split shift labels", () => {
    expect(getShiftDisplayLines(targetShift)).toEqual(["9:00 AM - 3:00 PM"])
    expect(getShiftDisplayLines(targetShift, "24h")).toEqual(["09:00 - 15:00"])
    expect(
      getShiftDisplayLines({
        ...targetShift,
        startTime: "22:00",
        endTime: "02:00",
      })
    ).toEqual(["10:00 PM - 2:00 AM"])
    expect(
      getShiftDisplayLines({
        id: "close",
        dayId: "monday",
        zoneId: "bar",
        shiftType: "closing",
        startTime: "17:30",
        endKind: "locationClose",
      })
    ).toEqual(["5:30 PM - Close"])
    const split: WorkspaceSplitShift = {
      id: "split",
      dayId: "monday",
      zoneId: "floor",
      shiftType: "split",
      segments: [
        { startTime: "09:00", endTime: "12:00" },
        { startTime: "17:00", endKind: "locationClose" },
      ],
    }
    expect(getShiftDisplayLines(split)).toEqual([
      "9:00 AM - 12:00 PM",
      "5:00 PM - Close",
    ])
    expect(getShiftDisplayLines(split, "24h")).toEqual([
      "09:00 - 12:00",
      "17:00 - Close",
    ])
  })
})
