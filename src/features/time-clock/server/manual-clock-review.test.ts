import { afterEach, describe, expect, it, vi } from "vitest"

import { managerClockOverride } from "@/features/time-clock/server/actions"

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  listOpenEntries: vi.fn(),
  update: vi.fn(),
  matchedShift: vi.fn(),
}))

vi.mock("@tanstack/react-start/server-only", () => ({}))
vi.mock("@/features/time-clock/server/queries", () => ({
  getEmployeeClockPageData: vi.fn(),
  getMatchedPublishedShift: mocks.matchedShift,
  listOpenEntries: mocks.listOpenEntries,
}))
vi.mock("@/features/onboarding/server/session", () => ({}))
vi.mock("@/features/billing/server/entitlements", () => ({
  requireTimeAttendanceAccess: vi.fn(),
}))
vi.mock("@/lib/supabase.server", () => ({
  createSupabaseServerClient: () => ({ from: mocks.from }),
}))
vi.mock("@/features/time-clock/server/shared", () => ({
  requireClockManagerScope: () => Promise.resolve({ userId: "manager-1" }),
  ensureLocationInScope: () =>
    Promise.resolve({
      id: "location-1",
      organizationId: "org-1",
    }),
  getRequestAuditFields: () => ({}),
}))

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe("manual clock-out review", () => {
  it.each([
    null,
    "Station would not scan.\nClock-in did not match a published shift.",
  ])(
    "preserves existing notes (%s) alongside the clock-out reasons",
    async (previousNotes) => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date("2026-10-16T16:30:00Z"))
      mocks.listOpenEntries.mockResolvedValue([
        {
          id: "entry-1",
          clocked_in_at: "2026-10-16T08:00:00Z",
          scheduled_start_at: "2026-10-16T08:00:00Z",
          scheduled_end_at: "2026-10-16T16:00:00Z",
          shift_segment: "full",
          source: "manager_override",
          status: "requires_review",
          notes: previousNotes,
        },
      ])
      const result = { data: { id: "employee-1" }, error: null }
      const read = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        maybeSingle: () => Promise.resolve(result),
      }
      const write = {
        update: mocks.update.mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: () => Promise.resolve({ data: { id: "entry-1" }, error: null }),
      }
      mocks.from.mockImplementation((table: string) => {
        if (table === "time_entries") return write
        if (table === "clock_events") {
          return { insert: () => Promise.resolve({ error: null }) }
        }
        return read
      })

      await managerClockOverride({
        locationId: "location-1",
        userId: "manager-1",
        employeeId: "employee-1",
        action: "clock_out",
        reason: "Forgot to tap out.",
      })

      expect(mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "requires_review",
          notes: [
            previousNotes,
            "Forgot to tap out.",
            "Clocked out 30 minutes after scheduled finish.",
          ]
            .filter(Boolean)
            .join("\n"),
        })
      )
    }
  )
  it("records a dashboard clock-in against the selected split-shift half", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-10-16T12:00:00Z"))
    mocks.listOpenEntries.mockResolvedValue([])
    mocks.matchedShift.mockResolvedValue({
      id: "published-split",
      dateLabel: "16 Oct",
      shiftType: "split",
      timeLabel: "Split",
      zoneName: "Bar",
      segments: [
        {
          key: "split_first",
          startsAt: "2026-10-16T08:00:00Z",
          endsAt: "2026-10-16T10:00:00Z",
          label: "First half",
          timeLabel: "08:00–10:00",
        },
        {
          key: "split_second",
          startsAt: "2026-10-16T12:00:00Z",
          endsAt: "2026-10-16T16:00:00Z",
          label: "Second half",
          timeLabel: "12:00–16:00",
        },
      ],
    })
    const insert = vi.fn().mockReturnThis()
    const chain = {
      data: [
        {
          shift_segment: "split_first",
          clocked_out_at: "2026-10-16T10:00:00Z",
        },
      ],
      error: null,
      insert,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      gt: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
      maybeSingle: () =>
        Promise.resolve({ data: { id: "employee-1" }, error: null }),
      single: () => Promise.resolve({ data: { id: "entry-2" }, error: null }),
    }
    mocks.from.mockReturnValue(chain)
    await managerClockOverride({
      locationId: "location-1",
      userId: "manager-1",
      employeeId: "employee-1",
      action: "clock_in",
      shiftSegment: "split_second",
      reason: "Station would not scan.",
    })
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        shift_segment: "split_second",
        rota_published_shift_id: "published-split",
        scheduled_start_at: "2026-10-16T12:00:00.000Z",
        scheduled_end_at: "2026-10-16T16:00:00.000Z",
        source: "manager_override",
        created_by: "manager-1",
      })
    )
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "manager_clock_in",
        performed_by_user_id: "manager-1",
        time_entry_id: "entry-2",
      })
    )
  })
})
