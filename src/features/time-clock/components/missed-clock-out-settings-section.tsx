import { BellRingIcon } from "lucide-react"

import type { ClockSettingsValues } from "@/features/time-clock/types"
import {
  HARD_REVIEW_OPTIONS,
  MISSED_CLOCK_OUT_ALERT_OPTIONS,
} from "@/features/time-clock/constants/clock-settings-options"
import {
  ClockSettingRow,
  ClockSettingSelect,
} from "@/features/time-clock/components/clock-setting-row"
import { ClockSettingsSection } from "@/features/time-clock/components/clock-settings-section"

function MissedClockOutSettingsSection({
  onUpdate,
  values,
}: {
  onUpdate: (patch: Partial<ClockSettingsValues>) => void
  values: ClockSettingsValues
}) {
  return (
    <ClockSettingsSection
      description="Catch open shifts quickly and route unusually long entries to a manager."
      icon={BellRingIcon}
      title="Missed clock-outs"
    >
      <ClockSettingRow
        description="Show managers a warning after the scheduled shift has ended."
        title="Forgotten clock-out alert"
      >
        <ClockSettingSelect
          label="Forgotten clock-out alert"
          onChange={(value) =>
            onUpdate({ forgottenClockOutAlertMinutes: Number(value) })
          }
          options={MISSED_CLOCK_OUT_ALERT_OPTIONS}
          value={values.forgottenClockOutAlertMinutes.toString()}
        />
      </ClockSettingRow>
      <ClockSettingRow
        description="Force an open entry into review after this amount of time."
        title="Require manager review"
      >
        <ClockSettingSelect
          label="Require manager review"
          onChange={(value) =>
            onUpdate({ hardReviewAfterMinutes: Number(value) })
          }
          options={HARD_REVIEW_OPTIONS.filter(
            (option) =>
              Number(option.value) >= values.forgottenClockOutAlertMinutes
          )}
          value={values.hardReviewAfterMinutes.toString()}
        />
      </ClockSettingRow>
    </ClockSettingsSection>
  )
}

export { MissedClockOutSettingsSection }
