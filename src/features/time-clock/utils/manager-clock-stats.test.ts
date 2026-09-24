import { describe, expect, it } from "vitest"

import type { ManagerClockPageData } from "@/features/time-clock/types"
import { getManagerClockStats } from "@/features/time-clock/utils/manager-clock-stats"

describe("getManagerClockStats", () => {
  it("summarises live, tracked, team, and exception counts", () => {
    const data: ManagerClockPageData = {
      writableLocationIds: [],
      selectedDate: "2026-07-13",
      locations: [{ id: "location-1", name: "Main Bar" }],
      employees: [
        {
          id: "employee-1",
          email: null,
          isActive: true,
          locationId: "location-1",
          locationName: "Main Bar",
          name: "Alex Turner",
          openEntry: {
            clockedInAt: "2026-07-13T08:00:00.000Z",
            id: "entry-1",
            isForgottenClockOutAlert: false,
            scheduledEndAt: null,
            source: "employee_nfc",
            status: "open",
          },
        },
        {
          id: "employee-2",
          email: null,
          isActive: true,
          locationId: "location-1",
          locationName: "Main Bar",
          name: "Jamie Oliver",
          openEntry: null,
        },
      ],
      activityEntries: [
        {
          clockedInAt: "2026-07-13T08:00:00.000Z",
          clockedOutAt: null,
          employeeId: "employee-1",
          employeeName: "Alex Turner",
          id: "entry-1",
          isForgottenClockOutAlert: false,
          locationId: "location-1",
          locationName: "Main Bar",
          scheduledEndAt: null,
          source: "employee_nfc",
          status: "open",
          zoneName: null,
        },
        {
          clockedInAt: "2026-07-13T07:00:00.000Z",
          clockedOutAt: "2026-07-13T08:00:00.000Z",
          employeeId: "employee-2",
          employeeName: "Jamie Oliver",
          id: "entry-2",
          isForgottenClockOutAlert: false,
          locationId: "location-1",
          locationName: "Main Bar",
          scheduledEndAt: null,
          source: "employee_nfc",
          status: "closed",
          zoneName: null,
        },
      ],
      failedAttempts: [
        {
          action: "clock_in",
          createdAt: "2026-07-13T09:00:00.000Z",
          employeeName: "Jamie Oliver",
          failureReason: "Tag was not recognised",
          gpsAccuracyMeters: null,
          gpsDistanceMeters: null,
          id: "attempt-1",
        },
      ],
      reviewEntries: [
        {
          clockedInAt: "2026-07-13T08:00:00.000Z",
          clockedOutAt: null,
          employeeName: "Alex Turner",
          id: "entry-1",
          locationId: "location-1",
          source: "employee_nfc",
        },
      ],
    }

    expect(
      getManagerClockStats(data, new Date("2026-07-13T10:00:00.000Z"))
    ).toEqual({
      exceptionCount: 2,
      openCount: 1,
      teamCount: 2,
      trackedMs: 10_800_000,
    })
  })
})
