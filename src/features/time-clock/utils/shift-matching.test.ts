import { describe, expect, it } from "vitest"

import {
  findBestShiftMatch,
  type PublishedShiftCandidate,
} from "@/features/time-clock/utils/shift-matching"

describe("findBestShiftMatch", () => {
  it("matches a standard shift inside the clocking window", () => {
    const match = findBestShiftMatch(
      [
        createShift({
          id: "standard",
          dayDate: "2026-06-06",
          startTime: "09:00:00",
          endTime: "17:00:00",
        }),
      ],
      new Date("2026-06-06T08:45:00"),
    )

    expect(match?.id).toBe("standard")
  })

  it("matches an overnight shift after midnight", () => {
    const match = findBestShiftMatch(
      [
        createShift({
          id: "overnight",
          dayDate: "2026-06-06",
          startTime: "20:00:00",
          endTime: "02:00:00",
        }),
      ],
      new Date("2026-06-07T01:30:00"),
    )

    expect(match?.id).toBe("overnight")
  })

  it("returns null when no shift is near the current time", () => {
    const match = findBestShiftMatch(
      [
        createShift({
          id: "morning",
          dayDate: "2026-06-06",
          startTime: "08:00:00",
          endTime: "12:00:00",
        }),
      ],
      new Date("2026-06-06T22:30:00"),
    )

    expect(match).toBeNull()
  })

  it("describes split shifts as two clockable segments", () => {
    const match = findBestShiftMatch(
      [
        createShift({
          id: "split",
          dayDate: "2026-06-06",
          endTime: "12:00:00",
          shiftType: "split",
          splitSecondEndTime: "20:00:00",
          splitSecondStartTime: "17:00:00",
          startTime: "08:00:00",
        }),
      ],
      new Date("2026-06-06T07:45:00"),
    )

    expect(match?.segments).toMatchObject([
      {
        key: "split_first",
        label: "First half",
        timeLabel: "08:00 - 12:00",
      },
      {
        key: "split_second",
        label: "Second half",
        timeLabel: "17:00 - 20:00",
      },
    ])
  })
})

function createShift(input: {
  dayDate: string
  endTime: string
  id: string
  shiftType?: string
  splitSecondEndTime?: string | null
  splitSecondStartTime?: string | null
  startTime: string
}): PublishedShiftCandidate {
  return {
    id: input.id,
    day_date: input.dayDate,
    end_kind: null,
    end_time: input.endTime,
    shift_type: input.shiftType ?? "standard",
    split_second_end_time: input.splitSecondEndTime ?? null,
    split_second_start_time: input.splitSecondStartTime ?? null,
    start_time: input.startTime,
    zone_name_snapshot: "Bar",
  }
}
