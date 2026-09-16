import { CalendarDaysIcon } from "lucide-react"

import type {
  RotaSettingsValues,
  RotaSettingsZone,
} from "@/features/settings/types"
import {
  RotaSettingRow,
  RotaSettingSelect,
  RotaSettingValue,
} from "@/features/settings/components/rota-setting-row"
import { RotaSettingsSection } from "@/features/settings/components/rota-settings-section"

function RotaDefaultsSettingsSection({
  onUpdate,
  values,
  zones,
}: {
  onUpdate: (patch: Partial<RotaSettingsValues>) => void
  values: RotaSettingsValues
  zones: Array<RotaSettingsZone>
}) {
  const zoneOptions = [
    { label: "All zones", value: "all" },
    ...zones.map((zone) => ({ label: zone.name, value: zone.id })),
  ]

  return (
    <RotaSettingsSection
      description="Choose the starting view and fixed planning defaults for this location."
      icon={CalendarDaysIcon}
      title="Rota defaults"
    >
      <RotaSettingRow
        description="Select which zone is shown first when a rota opens."
        title="Default zone filter"
      >
        <RotaSettingSelect
          label="Default zone filter"
          onChange={(value) =>
            onUpdate({ defaultZoneId: value === "all" ? null : value })
          }
          options={zoneOptions}
          value={values.defaultZoneId ?? "all"}
        />
      </RotaSettingRow>
      <RotaSettingRow
        description="RocketRota uses Monday-to-Sunday planning weeks."
        title="Week starts"
      >
        <RotaSettingValue>Monday</RotaSettingValue>
      </RotaSettingRow>
      <RotaSettingRow
        description="Review workspace changes before saving them to the rota."
        title="Save mode"
      >
        <RotaSettingValue>Review &amp; save</RotaSettingValue>
      </RotaSettingRow>
    </RotaSettingsSection>
  )
}

export { RotaDefaultsSettingsSection }
