import "@tanstack/react-start/server-only"
import type { ClockShiftSegment } from "@/features/time-clock/types"
import type { ScheduledClockWindow } from "@/features/time-clock/utils/pay-rules"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import {
  assertSupabaseSuccess,
  getRequiredSupabaseRow,
} from "@/lib/supabase-errors"

async function insertTimeEntry(input: {
  occurredAt: Date
  employeeId: string
  locationId: string
  notes: string | null
  organizationId: string | null
  payableStartAt: Date
  performedByUserId: string
  rotaPublishedShiftId: string | null
  scheduledWindow: ScheduledClockWindow | null
  shiftSegment: ClockShiftSegment
  source: "employee_nfc" | "manager_override"
  status: "open" | "requires_review"
}) {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("time_entries")
    .insert({
      clocked_in_at: input.occurredAt.toISOString(),
      created_by: input.performedByUserId,
      employee_id: input.employeeId,
      location_id: input.locationId,
      notes: input.notes,
      organization_id: input.organizationId,
      payable_start_at: input.payableStartAt.toISOString(),
      rota_published_shift_id: input.rotaPublishedShiftId,
      scheduled_end_at: input.scheduledWindow?.endsAt.toISOString() ?? null,
      scheduled_start_at: input.scheduledWindow?.startsAt.toISOString() ?? null,
      shift_segment: input.shiftSegment,
      source: input.source,
      status: input.status,
      updated_by: input.performedByUserId,
      user_id: input.performedByUserId,
    })
    .select("id, clocked_in_at, status")
    .single()

  assertSupabaseSuccess(result.error, "We could not clock in right now.")
  return getRequiredSupabaseRow(result.data, "We could not clock in right now.")
}

async function updateTimeEntryForClockOut(input: {
  occurredAt: Date
  entryId: string
  notes: string | null
  payableEndAt: Date
  performedByUserId: string
  status: "closed" | "requires_review"
}) {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("time_entries")
    .update({
      clocked_out_at: input.occurredAt.toISOString(),
      notes: input.notes,
      payable_end_at: input.payableEndAt.toISOString(),
      status: input.status,
      updated_by: input.performedByUserId,
    })
    .eq("id", input.entryId)
    .is("clocked_out_at", null)
    .select("id, clocked_out_at, status")
    .single()

  assertSupabaseSuccess(result.error, "We could not clock out right now.")
  return getRequiredSupabaseRow(
    result.data,
    "We could not clock out right now."
  )
}

async function insertClockEvent(input: {
  occurredAt: Date
  employeeId: string
  eventType: "manager_clock_in" | "manager_clock_out"
  locationId: string
  organizationId: string | null
  performedByUserId: string
  reason: string | null
  timeEntryId: string
}) {
  const supabase = createSupabaseServerClient()
  const result = await supabase.from("clock_events").insert({
    event_at: input.occurredAt.toISOString(),
    metadata: { recorded_at: new Date().toISOString() },
    employee_id: input.employeeId,
    event_type: input.eventType,
    location_id: input.locationId,
    organization_id: input.organizationId,
    performed_by_user_id: input.performedByUserId,
    reason: input.reason,
    time_entry_id: input.timeEntryId,
  })

  assertSupabaseSuccess(result.error, "We could not record the clock event.")
}

async function getEmployeeForOverride(input: {
  employeeId: string
  locationId: string
}) {
  const supabase = createSupabaseServerClient()
  const assignmentResult = await supabase
    .from("employee_location_assignments")
    .select("employee_id")
    .eq("employee_id", input.employeeId)
    .eq("location_id", input.locationId)
    .eq("is_enabled", true)
    .is("disabled_at", null)
    .maybeSingle()

  assertSupabaseSuccess(
    assignmentResult.error,
    "We could not load that team member."
  )

  if (!assignmentResult.data) {
    throw new Error("That active team member is not assigned to this location.")
  }

  const employeeResult = await supabase
    .from("employees")
    .select("id")
    .eq("id", input.employeeId)
    .eq("status", "active")
    .maybeSingle()

  assertSupabaseSuccess(
    employeeResult.error,
    "We could not load that team member."
  )
  return getRequiredSupabaseRow(
    employeeResult.data,
    "That active team member is not assigned to this location."
  )
}

async function assertNoLaterClockEntry(
  employeeId: string,
  locationId: string,
  time: Date
): Promise<void> {
  const result = await createSupabaseServerClient()
    .from("time_entries")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("location_id", locationId)
    .gt("clocked_out_at", time.toISOString())
    .limit(1)
  assertSupabaseSuccess(
    result.error,
    "We could not check existing clock entries."
  )
  if (result.data?.length) {
    throw new Error(
      "This clock-in would overlap an existing entry. Edit the timesheet instead."
    )
  }
}

export {
  assertNoLaterClockEntry,
  getEmployeeForOverride,
  insertClockEvent,
  insertTimeEntry,
  updateTimeEntryForClockOut,
}
