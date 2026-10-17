import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import type { ManagerClockPageData } from "@/features/time-clock/types"
import { TimeClockExceptionsSection } from "@/features/time-clock/components/time-clock-exceptions-section"

function renderException(notes: string | null): string {
  const data: ManagerClockPageData = {
    selectedDate: "2026-10-16",
    writableLocationIds: ["location-1"],
    locations: [],
    employees: [],
    activityEntries: [],
    failedAttempts: [],
    reviewEntries: [
      {
        id: "entry-1",
        locationId: "location-1",
        employeeName: "Sam",
        clockedInAt: "2026-10-16T08:00:00Z",
        clockedOutAt: "2026-10-16T16:30:00Z",
        source: "manager_override",
        notes,
      },
    ],
  }

  return renderToStaticMarkup(
    createElement(TimeClockExceptionsSection, {
      data,
      isApproving: false,
      onApprove: vi.fn(),
    })
  )
}

describe("clock exception review details", () => {
  it("shows the manual explanation and automatic review reason before approval", () => {
    const markup = renderException(
      "Station would not scan.\nClocked out 30 minutes after scheduled finish."
    )

    expect(markup).toContain("Reason for review")
    expect(markup).toContain("Station would not scan.")
    expect(markup).toContain("Clocked out 30 minutes after scheduled finish.")
    expect(markup).toContain(" · Out ")
    expect(markup).toContain("Approve")
  })

  it("explains when an older review entry has no saved reason", () => {
    expect(renderException(null)).toContain(
      "No reason was recorded for this entry."
    )
  })
})
