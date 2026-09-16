import { MegaphoneIcon } from "lucide-react"

import type { RotaSettingsValues } from "@/features/settings/types"
import {
  RotaSettingRow,
  RotaSettingSwitch,
} from "@/features/settings/components/rota-setting-row"
import { RotaSettingsSection } from "@/features/settings/components/rota-settings-section"

function RotaPublishingSettingsSection({
  onUpdate,
  values,
}: {
  onUpdate: (patch: Partial<RotaSettingsValues>) => void
  values: RotaSettingsValues
}) {
  return (
    <RotaSettingsSection
      description="Choose what staff receive and can see after a rota is published."
      icon={MegaphoneIcon}
      title="Publishing & visibility"
    >
      <RotaSettingRow
        description="Send the normal email and push updates when a rota is published."
        title="Notify staff on publish"
      >
        <RotaSettingSwitch
          checked={values.notifyStaffOnPublish}
          label="Notify staff on publish"
          onCheckedChange={(checked) =>
            onUpdate({ notifyStaffOnPublish: checked })
          }
        />
      </RotaSettingRow>
      <RotaSettingRow
        description="Include the weekly staff note in the published rota view."
        title="Show rota notes to staff"
      >
        <RotaSettingSwitch
          checked={values.showNotesToStaff}
          label="Show rota notes to staff"
          onCheckedChange={(checked) => onUpdate({ showNotesToStaff: checked })}
        />
      </RotaSettingRow>
    </RotaSettingsSection>
  )
}

export { RotaPublishingSettingsSection }
