import { BellRingIcon } from "lucide-react"
import { ClockDurationInput } from "./clock-duration-input"
import type { ClockSettingsValues } from "@/features/time-clock/types"
import { ClockSettingRow } from "@/features/time-clock/components/clock-setting-row"
import { CLOCK_OUT_TIME_LIMITS } from "@/features/time-clock/constants/automatic-clock-out"
import { ClockSettingsSection } from "@/features/time-clock/components/clock-settings-section"

function MissedClockOutSettingsSection({
  values,
  onUpdate,
  disabled,
}: {
  values: ClockSettingsValues
  onUpdate: (patch: Partial<ClockSettingsValues>) => void
  disabled?: boolean
}) {
  return (
    <ClockSettingsSection
      description="Set this location's timings in minutes. Changes save when you leave a field and apply to open shifts at the next check. All automatic clock-outs require manager review."
      icon={BellRingIcon}
      title="Missed clock-outs"
    >
      <ClockSettingRow
        description="Send a push notification after the scheduled finish. Employees must enable notifications on their device."
        title="Clock-out reminder"
      >
        <ClockDurationInput
          label="Clock-out reminder after scheduled finish"
          value={values.forgottenClockOutAlertMinutes}
          min={CLOCK_OUT_TIME_LIMITS.reminder.min}
          max={Math.min(
            CLOCK_OUT_TIME_LIMITS.reminder.max,
            values.hardReviewAfterMinutes - 1
          )}
          disabled={disabled}
          onChange={(minutes) =>
            onUpdate({ forgottenClockOutAlertMinutes: minutes })
          }
        />
      </ClockSettingRow>
      <ClockSettingRow
        description="Close the timer and flag the scheduled finish as an estimate for manager review."
        title="Scheduled automatic clock-out"
      >
        <ClockDurationInput
          label="Automatic clock-out after scheduled finish"
          value={values.hardReviewAfterMinutes}
          min={Math.max(
            CLOCK_OUT_TIME_LIMITS.scheduledDelay.min,
            values.forgottenClockOutAlertMinutes + 1
          )}
          max={CLOCK_OUT_TIME_LIMITS.scheduledDelay.max}
          disabled={disabled}
          onChange={(minutes) => onUpdate({ hardReviewAfterMinutes: minutes })}
        />
      </ClockSettingRow>
      <ClockSettingRow
        title="Unscheduled shift maximum"
        description="Automatically close unscheduled entries after this amount of time from clock-in."
      >
        <ClockDurationInput
          label="Maximum unscheduled shift duration"
          value={values.unscheduledClockOutAfterMinutes}
          min={Math.max(
            CLOCK_OUT_TIME_LIMITS.unscheduledLimit.min,
            values.unscheduledClockOutReminderMinutes + 1
          )}
          max={CLOCK_OUT_TIME_LIMITS.unscheduledLimit.max}
          disabled={disabled}
          onChange={(minutes) =>
            onUpdate({ unscheduledClockOutAfterMinutes: minutes })
          }
        />
      </ClockSettingRow>
      <ClockSettingRow
        title="Unscheduled reminder"
        description="Remind the employee this long before the unscheduled shift maximum."
      >
        <ClockDurationInput
          label="Unscheduled reminder before maximum"
          value={values.unscheduledClockOutReminderMinutes}
          min={CLOCK_OUT_TIME_LIMITS.unscheduledReminder.min}
          max={Math.min(
            CLOCK_OUT_TIME_LIMITS.unscheduledReminder.max,
            values.unscheduledClockOutAfterMinutes - 1
          )}
          disabled={disabled}
          onChange={(minutes) =>
            onUpdate({ unscheduledClockOutReminderMinutes: minutes })
          }
        />
      </ClockSettingRow>
    </ClockSettingsSection>
  )
}

export { MissedClockOutSettingsSection }
