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
import { getDefaultRotaZoneId } from "@/features/rota/utils/default-rota-zone"

function RotaDefaultsSettingsSection({
  onUpdate,
  values,
  zones,
}: {
  onUpdate: (patch: Partial<RotaSettingsValues>) => void
  values: RotaSettingsValues
  zones: Array<RotaSettingsZone>
}) {
  const zoneOptions = zones.map((zone) => ({
    label: zone.name,
    value: zone.id,
  }))
  const defaultZoneId = getDefaultRotaZoneId(zones, values.defaultZoneId)

  return (
    <RotaSettingsSection
      description="Choose the starting view and fixed planning defaults for this location."
      icon={CalendarDaysIcon}
      title="Rota defaults"
    >
      <RotaSettingRow
        description="Select which zone is shown first when a rota opens."
        title="Default zone"
      >
        {defaultZoneId ? (
          <RotaSettingSelect
            label="Default zone"
            onChange={(value) => onUpdate({ defaultZoneId: value })}
            options={zoneOptions}
            value={defaultZoneId}
          />
        ) : (
          <RotaSettingValue>No zones available</RotaSettingValue>
        )}
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
