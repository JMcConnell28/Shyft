import "@tanstack/react-start/server-only"
import type { ClockPayRuleSettings } from "@/features/time-clock/utils/pay-rules"
import { createSupabaseServerClient } from "@/lib/supabase.server"
import { assertSupabaseSuccess } from "@/lib/supabase-errors"
import { DEFAULT_CLOCK_TIME_ZONE } from "@/lib/time-zone"
import {
  CLOCK_OUT_REMINDER_MINUTES,
  SCHEDULED_CLOCK_OUT_DELAY_MINUTES,
} from "@/features/time-clock/constants/automatic-clock-out"

async function getLocationClockSettings(
  locationId: string
): Promise<{ rules: ClockPayRuleSettings; timeZone: string }> {
  const supabase = createSupabaseServerClient()
  const result = await supabase
    .from("location_clock_settings")
    .select(
      "early_clock_in_grace_minutes, early_start_review_minutes, forgotten_clock_out_alert_minutes, hard_review_after_minutes, late_clock_in_grace_minutes, late_clock_out_grace_minutes, late_finish_review_minutes, late_start_review_minutes, timezone"
    )
    .eq("location_id", locationId)
    .maybeSingle()

  assertSupabaseSuccess(result.error, "We could not load clock settings.")

  return {
    rules: {
      earlyClockInGraceMinutes: result.data?.early_clock_in_grace_minutes ?? 10,
      earlyStartReviewMinutes: result.data?.early_start_review_minutes ?? 15,
      forgottenClockOutAlertMinutes:
        result.data?.forgotten_clock_out_alert_minutes ??
        CLOCK_OUT_REMINDER_MINUTES,
      hardReviewAfterMinutes:
        result.data?.hard_review_after_minutes ??
        SCHEDULED_CLOCK_OUT_DELAY_MINUTES,
      lateClockInGraceMinutes: result.data?.late_clock_in_grace_minutes ?? 5,
      lateClockOutGraceMinutes: result.data?.late_clock_out_grace_minutes ?? 10,
      lateFinishReviewMinutes: result.data?.late_finish_review_minutes ?? 15,
      lateStartReviewMinutes: result.data?.late_start_review_minutes ?? 15,
    },
    timeZone: result.data?.timezone ?? DEFAULT_CLOCK_TIME_ZONE,
  }
}

export { getLocationClockSettings }
