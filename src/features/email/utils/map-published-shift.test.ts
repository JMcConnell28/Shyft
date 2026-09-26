import { describe, expect, it } from "vitest"

import type { PublishedShiftDetails } from "@/features/email/types/rota-published"
import { mapPublishedShift } from "@/features/email/utils/map-published-shift"

const baseShift: PublishedShiftDetails = {
  estimated_closing_time: "23:00:00",
  estimated_closing_time_next_day: false,
  location_close_time: null,
  location_close_time_next_day: null,
  shift_day_date: "2025-09-29",
  shift_end_kind: null,
  shift_end_time: "23:00:00",
  shift_split_second_end_time: null,
  shift_split_second_start_time: null,
  shift_start_time: "17:00:00",
  shift_type: "standard",
  zone_name: "Bar",
}

describe("mapPublishedShift", () => {
  it("calculates standard and overnight shift hours", () => {
    expect(mapPublishedShift(baseShift).durationMinutes).toBe(360)
    expect(
      mapPublishedShift({
        ...baseShift,
        shift_end_time: "01:00:00",
        shift_start_time: "19:00:00",
      }).durationMinutes
    ).toBe(360)
  })

  it("uses the location close time for closing shifts", () => {
    expect(
      mapPublishedShift({
        ...baseShift,
        location_close_time: "01:00:00",
        location_close_time_next_day: true,
        shift_end_kind: "location_close",
        shift_end_time: null,
        shift_type: "closing",
      })
    ).toMatchObject({ durationMinutes: 480, timeLabel: "17:00 – Close" })
  })

  it("adds both parts of a split shift", () => {
    expect(
      mapPublishedShift({
        ...baseShift,
        shift_end_time: "14:00:00",
        shift_split_second_start_time: "18:00:00",
        shift_split_second_end_time: "22:00:00",
        shift_start_time: "10:00:00",
        shift_type: "split",
      })
    ).toMatchObject({
      durationMinutes: 480,
      timeLabel: "10:00 – 14:00, 18:00 – 22:00",
    })

    expect(
      mapPublishedShift({
        ...baseShift,
        location_close_time: "01:00:00",
        location_close_time_next_day: true,
        shift_end_kind: "location_close",
        shift_end_time: "14:00:00",
        shift_split_second_start_time: "19:00:00",
        shift_split_second_end_time: null,
        shift_start_time: "10:00:00",
        shift_type: "split",
      })
    ).toMatchObject({
      durationMinutes: 600,
      timeLabel: "10:00 – 14:00, 19:00 – Close",
    })
  })
})
