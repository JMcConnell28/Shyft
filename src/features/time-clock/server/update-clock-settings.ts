import "@tanstack/react-start/server-only"
import { ensureLocationInScope, requireClockSettingsScope } from "./shared"
import type { z } from "zod"
import type { updateClockSettingsInputSchema } from "@/features/time-clock/schemas/time-clock-schemas"
import { requireTimeAttendanceAccess } from "@/features/billing/server/entitlements"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"

async function updateClockSettings(
  input: z.infer<typeof updateClockSettingsInputSchema>
): Promise<{ success: true }> {
  const scope = await requireClockSettingsScope(input)
  const location = await ensureLocationInScope(scope, input.locationId)
  await requireTimeAttendanceAccess(location.id)
  if ((input.latitude === null) !== (input.longitude === null)) {
    throw new Error("Set both latitude and longitude, or leave both empty.")
  }
  const result = await createSupabaseServerClient()
    .from("location_clock_settings")
    .upsert(
      {
        early_clock_in_grace_minutes: input.earlyClockInGraceMinutes,
        early_start_review_minutes: input.earlyStartReviewMinutes,
        forgotten_clock_out_alert_minutes: input.forgottenClockOutAlertMinutes,
        hard_review_after_minutes: input.hardReviewAfterMinutes,
        unscheduled_clock_out_after_minutes:
          input.unscheduledClockOutAfterMinutes,
        unscheduled_clock_out_reminder_minutes:
          input.unscheduledClockOutReminderMinutes,
        is_enabled: input.isEnabled,
        late_clock_in_grace_minutes: input.lateClockInGraceMinutes,
        late_clock_out_grace_minutes: input.lateClockOutGraceMinutes,
        late_finish_review_minutes: input.lateFinishReviewMinutes,
        late_start_review_minutes: input.lateStartReviewMinutes,
        latitude: input.latitude,
        longitude: input.longitude,
        location_id: input.locationId,
        organization_id: location.organizationId,
        max_accuracy_meters: input.maxAccuracyMeters,
        radius_meters: input.radiusMeters,
        timezone: input.timezone,
      },
      { onConflict: "location_id" }
    )
  assertSupabaseSuccess(result.error, "We could not save clock settings.")
  return { success: true }
}

export { updateClockSettings }
