import { Clock3Icon } from "lucide-react"

import type { ClockSettingsValues } from "@/features/time-clock/types"
import {
  GRACE_PERIOD_OPTIONS,
  REVIEW_THRESHOLD_OPTIONS,
} from "@/features/time-clock/constants/clock-settings-options"
import {
  ClockSettingRow,
  ClockSettingSelect,
} from "@/features/time-clock/components/clock-setting-row"
import { ClockSettingsSection } from "@/features/time-clock/components/clock-settings-section"

type ClockingRulesSettingsSectionProps = {
  onUpdate: (patch: Partial<ClockSettingsValues>) => void
  values: ClockSettingsValues
}

function ClockingRulesSettingsSection({
  onUpdate,
  values,
}: ClockingRulesSettingsSectionProps) {
  return (
    <ClockSettingsSection
      description="Set the grace periods used to calculate payable time and flag unusual taps."
      icon={Clock3Icon}
      title="Clocking rules"
    >
      <MinutesSetting
        description="How early a station tap can start paid time before a shift."
        label="Early clock-in allowance"
        onChange={(earlyClockInGraceMinutes) =>
          onUpdate({ earlyClockInGraceMinutes })
        }
        options={GRACE_PERIOD_OPTIONS}
        value={values.earlyClockInGraceMinutes}
      />
      <MinutesSetting
        description="Flag a clock-in for review when it is earlier than this."
        label="Review early arrivals"
        onChange={(earlyStartReviewMinutes) =>
          onUpdate({ earlyStartReviewMinutes })
        }
        options={REVIEW_THRESHOLD_OPTIONS.filter(
          (option) => Number(option.value) >= values.earlyClockInGraceMinutes
        )}
        value={values.earlyStartReviewMinutes}
      />
      <MinutesSetting
        description="Allow a short delay before treating a clock-in as late."
        label="Late arrival grace period"
        onChange={(lateClockInGraceMinutes) =>
          onUpdate({ lateClockInGraceMinutes })
        }
        options={GRACE_PERIOD_OPTIONS}
        value={values.lateClockInGraceMinutes}
      />
      <MinutesSetting
        description="Ask for a reason when a clock-in is later than this."
        label="Review late arrivals"
        onChange={(lateStartReviewMinutes) =>
          onUpdate({ lateStartReviewMinutes })
        }
        options={REVIEW_THRESHOLD_OPTIONS.filter(
          (option) => Number(option.value) >= values.lateClockInGraceMinutes
        )}
        value={values.lateStartReviewMinutes}
      />
      <MinutesSetting
        description="How long paid time may continue after the scheduled finish."
        label="Late clock-out allowance"
        onChange={(lateClockOutGraceMinutes) =>
          onUpdate({ lateClockOutGraceMinutes })
        }
        options={GRACE_PERIOD_OPTIONS}
        value={values.lateClockOutGraceMinutes}
      />
      <MinutesSetting
        description="Flag a clock-out for review when it is later than this."
        label="Review late finishes"
        onChange={(lateFinishReviewMinutes) =>
          onUpdate({ lateFinishReviewMinutes })
        }
        options={REVIEW_THRESHOLD_OPTIONS.filter(
          (option) => Number(option.value) >= values.lateClockOutGraceMinutes
        )}
        value={values.lateFinishReviewMinutes}
      />
    </ClockSettingsSection>
  )
}

function MinutesSetting({
  description,
  label,
  onChange,
  options,
  value,
}: {
  description: string
  label: string
  onChange: (value: number) => void
  options: Array<{ label: string; value: string }>
  value: number
}) {
  return (
    <ClockSettingRow description={description} title={label}>
      <ClockSettingSelect
        label={label}
        onChange={(nextValue) => onChange(Number(nextValue))}
        options={options}
        value={value.toString()}
      />
    </ClockSettingRow>
  )
}

export { ClockingRulesSettingsSection }
