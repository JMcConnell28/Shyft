import "@tanstack/react-start/server-only"
import { getMatchedPublishedShift, listOpenEntries } from "./queries"
import { getLocationClockSettings } from "./clock-settings"
import {
  assertNoLaterClockEntry,
  getEmployeeForOverride,
  insertClockEvent,
  insertTimeEntry,
  updateTimeEntryForClockOut,
} from "./manager-clock-data"
import {
  ensureShiftSegmentCanStart,
  getScheduledWindow,
} from "./shift-segments"
import { ensureLocationInScope, requireClockManagerScope } from "./shared"
import type { managerClockOverrideInputSchema } from "@/features/time-clock/schemas/time-clock-schemas"
import type { z } from "zod"
import { requireLocationFeature } from "@/features/feature-flags/server/evaluation"
import { requireTimeAttendanceAccess } from "@/features/billing/server/entitlements"
import {
  getPayableClockIn,
  getPayableClockOut,
} from "@/features/time-clock/utils/pay-rules"
import { joinNotes } from "@/features/time-clock/utils/join-notes"
import { getManualClockTime } from "@/features/time-clock/utils/manual-clock-time"

async function managerClockOverride(
  input: z.infer<typeof managerClockOverrideInputSchema>
) {
  const occurredAt = getManualClockTime(input.occurredAt)
  const scope = await requireClockManagerScope(input)
  const location = await ensureLocationInScope(scope, input.locationId)
  await requireTimeAttendanceAccess(location.id)
  const employee = await getEmployeeForOverride({
    employeeId: input.employeeId,
    locationId: input.locationId,
  })

  if (input.action === "clock_in") {
    await requireLocationFeature("time_clock.clock_in", location.id)
    const openEntries = await listOpenEntries({
      employeeId: employee.id,
      locationId: input.locationId,
    })

    if (openEntries.length > 0) {
      throw new Error("That team member is already clocked in.")
    }

    await assertNoLaterClockEntry(employee.id, input.locationId, occurredAt)

    const { rules, timeZone } = await getLocationClockSettings(input.locationId)
    const matchedShift = await getMatchedPublishedShift({
      employeeId: employee.id,
      locationId: input.locationId,
      now: occurredAt,
      timeZone,
    })
    const shiftSegment = input.shiftSegment ?? "full"
    const scheduledWindow = getScheduledWindow(matchedShift, shiftSegment)
    if (input.shiftSegment) {
      await ensureShiftSegmentCanStart({
        employeeId: employee.id,
        rotaPublishedShiftId: matchedShift?.id ?? null,
        shiftSegment,
      })
    }
    const payable = getPayableClockIn({
      actualClockInAt: occurredAt,
      rules,
      scheduledWindow,
    })
    const entry = await insertTimeEntry({
      occurredAt,
      employeeId: employee.id,
      locationId: input.locationId,
      notes: joinNotes(input.reason, payable.reviewReason),
      organizationId: location.organizationId,
      payableStartAt: payable.payableStartAt,
      performedByUserId: scope.userId,
      rotaPublishedShiftId: matchedShift?.id ?? null,
      scheduledWindow,
      shiftSegment,
      source: "manager_override",
      status: payable.reviewReason ? "requires_review" : "open",
    })

    await insertClockEvent({
      occurredAt,
      employeeId: employee.id,
      eventType: "manager_clock_in",
      locationId: input.locationId,
      organizationId: location.organizationId,
      performedByUserId: scope.userId,
      reason: input.reason,
      timeEntryId: entry.id,
    })

    return entry
  }

  const openEntries = await listOpenEntries({
    employeeId: employee.id,
    locationId: input.locationId,
  })

  if (openEntries.length !== 1) {
    throw new Error(
      openEntries.length === 0
        ? "That team member is not currently clocked in."
        : "That team member has multiple open entries and needs review."
    )
  }

  const { rules } = await getLocationClockSettings(input.locationId)
  const scheduledWindow =
    openEntries[0].scheduled_start_at && openEntries[0].scheduled_end_at
      ? {
          startsAt: new Date(openEntries[0].scheduled_start_at),
          endsAt: new Date(openEntries[0].scheduled_end_at),
        }
      : null
  if (occurredAt < new Date(openEntries[0].clocked_in_at)) {
    throw new Error("Clock-out must be at or after the clock-in time.")
  }
  const payable = getPayableClockOut({
    actualClockOutAt: occurredAt,
    rules,
    scheduledWindow,
  })
  const status =
    openEntries[0].status === "requires_review" || payable.reviewReason
      ? "requires_review"
      : "closed"
  const entry = await updateTimeEntryForClockOut({
    occurredAt,
    entryId: openEntries[0].id,
    notes: joinNotes(openEntries[0].notes, input.reason, payable.reviewReason),
    payableEndAt: payable.payableEndAt,
    performedByUserId: scope.userId,
    status,
  })

  await insertClockEvent({
    occurredAt,
    employeeId: employee.id,
    eventType: "manager_clock_out",
    locationId: input.locationId,
    organizationId: location.organizationId,
    performedByUserId: scope.userId,
    reason: input.reason,
    timeEntryId: entry.id,
  })

  return entry
}

export { managerClockOverride }
