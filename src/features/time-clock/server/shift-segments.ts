import "@tanstack/react-start/server-only"
import type {
  ClockShiftSegment,
  ClockShiftSummary,
} from "@/features/time-clock/types"
import type { ScheduledClockWindow } from "@/features/time-clock/utils/pay-rules"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

async function ensureShiftSegmentCanStart(input: {
  employeeId: string
  rotaPublishedShiftId: string | null
  shiftSegment: ClockShiftSegment
}) {
  if (!input.rotaPublishedShiftId) {
    return
  }

  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("time_entries")
    .select("shift_segment, clocked_out_at")
    .eq("employee_id", input.employeeId)
    .eq("rota_published_shift_id", input.rotaPublishedShiftId)

  assertSupabaseSuccess(result.error, "We could not check that shift.")
  const entries = result.data ?? []

  if (entries.some((entry) => entry.shift_segment === input.shiftSegment)) {
    throw new Error("That part of this shift has already been clocked.")
  }

  if (
    input.shiftSegment === "split_first" &&
    entries.some((entry) => entry.shift_segment === "split_second")
  ) {
    throw new Error("The first half can no longer be started.")
  }

  if (input.shiftSegment === "split_second") {
    const firstHalf = entries.find(
      (entry) => entry.shift_segment === "split_first"
    )

    if (!firstHalf?.clocked_out_at) {
      throw new Error("Finish the first half before starting the second half.")
    }
  }
}

function getClockInShiftSegment(input: {
  matchedShift: { shiftType: string } | null
  requestedSegment?: ClockShiftSegment
}): ClockShiftSegment {
  if (input.matchedShift?.shiftType !== "split") {
    return "full"
  }

  if (
    input.requestedSegment === "split_first" ||
    input.requestedSegment === "split_second"
  ) {
    return input.requestedSegment
  }

  throw new Error("Choose which half of your split shift you are starting.")
}

function getScheduledWindow(
  matchedShift: ClockShiftSummary | null,
  shiftSegment: ClockShiftSegment
): ScheduledClockWindow | null {
  const segment = matchedShift?.segments.find(
    (candidate) => candidate.key === shiftSegment
  )

  if (!segment) {
    return null
  }

  return {
    startsAt: new Date(segment.startsAt),
    endsAt: new Date(segment.endsAt),
  }
}

export {
  ensureShiftSegmentCanStart,
  getClockInShiftSegment,
  getScheduledWindow,
}
