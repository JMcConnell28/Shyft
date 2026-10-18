import { z } from "zod"
import { CLOCK_OUT_TIME_LIMITS } from "@/features/time-clock/constants/automatic-clock-out"

function minuteDuration(limits: { min: number; max: number }) {
  return z.number().int().min(limits.min).max(limits.max)
}

const clockAutomationSettingsSchema = z
  .object({
    forgottenClockOutAlertMinutes: minuteDuration(
      CLOCK_OUT_TIME_LIMITS.reminder
    ),
    hardReviewAfterMinutes: minuteDuration(
      CLOCK_OUT_TIME_LIMITS.scheduledDelay
    ),
    unscheduledClockOutAfterMinutes: minuteDuration(
      CLOCK_OUT_TIME_LIMITS.unscheduledLimit
    ),
    unscheduledClockOutReminderMinutes: minuteDuration(
      CLOCK_OUT_TIME_LIMITS.unscheduledReminder
    ),
  })
  .refine(
    (value) =>
      value.forgottenClockOutAlertMinutes < value.hardReviewAfterMinutes,
    {
      path: ["hardReviewAfterMinutes"],
      message: "Scheduled automatic clock-out must happen after the reminder.",
    }
  )
  .refine(
    (value) =>
      value.unscheduledClockOutReminderMinutes <
      value.unscheduledClockOutAfterMinutes,
    {
      path: ["unscheduledClockOutReminderMinutes"],
      message:
        "The unscheduled reminder must be shorter than the maximum shift duration.",
    }
  )

type ClockAutomationSettings = z.infer<typeof clockAutomationSettingsSchema>

export { clockAutomationSettingsSchema }
export type { ClockAutomationSettings }
