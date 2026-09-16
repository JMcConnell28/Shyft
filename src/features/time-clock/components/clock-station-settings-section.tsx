import { RadioTowerIcon } from "lucide-react"

import type {
  ClockSettingsLocation,
  ClockSettingsValues,
} from "@/features/time-clock/types"
import { CLOCK_TIMEZONE_OPTIONS } from "@/features/time-clock/constants/clock-settings-options"
import {
  ClockSettingRow,
  ClockSettingSelect,
  ClockSettingSwitch,
  ClockSettingValue,
} from "@/features/time-clock/components/clock-setting-row"
import { ClockSettingsSection } from "@/features/time-clock/components/clock-settings-section"
import { ClockStationActivationPanel } from "@/features/time-clock/components/clock-station-activation-panel"

type ClockStationSettingsSectionProps = {
  isActivating: boolean
  location: ClockSettingsLocation
  onActivate: (locationId: string) => void
  onUpdate: (patch: Partial<ClockSettingsValues>) => void
  values: ClockSettingsValues
}

function ClockStationSettingsSection({
  isActivating,
  location,
  onActivate,
  onUpdate,
  values,
}: ClockStationSettingsSectionProps) {
  return (
    <ClockSettingsSection
      description="Control how staff access the in-person clock and which location time is used."
      icon={RadioTowerIcon}
      title="Clock-in stations"
    >
      <ClockStationActivationPanel
        isPending={isActivating}
        location={location}
        onActivate={onActivate}
      />
      <ClockSettingRow
        description="Allow assigned staff to clock in and out from an NFC station."
        title="Enable employee clocking"
      >
        <ClockSettingSwitch
          checked={values.isEnabled}
          label="Enable employee clocking"
          onCheckedChange={(isEnabled) => onUpdate({ isEnabled })}
        />
      </ClockSettingRow>
      <ClockSettingRow
        description="Active NFC tags registered for this location."
        title="Registered stations"
      >
        <ClockSettingValue>
          {location.ntagTags.length} station
          {location.ntagTags.length === 1 ? "" : "s"}
        </ClockSettingValue>
      </ClockSettingRow>
      <ClockSettingRow
        description="Used when matching station taps with published shifts."
        title="Location timezone"
      >
        <ClockSettingSelect
          label="Location timezone"
          onChange={(timezone) => onUpdate({ timezone })}
          options={CLOCK_TIMEZONE_OPTIONS}
          value={values.timezone}
        />
      </ClockSettingRow>
    </ClockSettingsSection>
  )
}

export { ClockStationSettingsSection }
