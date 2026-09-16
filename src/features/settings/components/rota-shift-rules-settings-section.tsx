import { UsersRoundIcon } from "lucide-react"

import {
  RotaSettingRow,
  RotaSettingValue,
} from "@/features/settings/components/rota-setting-row"
import { RotaSettingsSection } from "@/features/settings/components/rota-settings-section"

function RotaShiftRulesSettingsSection() {
  return (
    <RotaSettingsSection
      description="Use RocketRota's built-in planning rules for clearer, safer rotas."
      icon={UsersRoundIcon}
      title="Shift rules"
    >
      <RotaSettingRow
        description="Build two working periods for the same team member in one day."
        title="Split shifts"
      >
        <RotaSettingValue tone="positive">Enabled</RotaSettingValue>
      </RotaSettingRow>
      <RotaSettingRow
        description="Assign every shift to an operational area such as Bar or Kitchen."
        title="Zone-based shifts"
      >
        <RotaSettingValue tone="positive">Enabled</RotaSettingValue>
      </RotaSettingRow>
      <RotaSettingRow
        description="Prevent the same team member being placed on overlapping shifts."
        title="Overlapping shift protection"
      >
        <RotaSettingValue tone="positive">Always on</RotaSettingValue>
      </RotaSettingRow>
    </RotaSettingsSection>
  )
}

export { RotaShiftRulesSettingsSection }
