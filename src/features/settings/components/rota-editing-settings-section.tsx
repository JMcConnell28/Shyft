import { PencilLineIcon } from "lucide-react"

import type { RotaSettingsValues } from "@/features/settings/types"
import {
  RotaSettingRow,
  RotaSettingSwitch,
} from "@/features/settings/components/rota-setting-row"
import { RotaSettingsSection } from "@/features/settings/components/rota-settings-section"

function RotaEditingSettingsSection({
  onUpdate,
  values,
}: {
  onUpdate: (patch: Partial<RotaSettingsValues>) => void
  values: RotaSettingsValues
}) {
  return (
    <RotaSettingsSection
      description="Control how managers change live rotas and remove shifts."
      icon={PencilLineIcon}
      title="Editing behaviour"
    >
      <RotaSettingRow
        description="Managers can make changes after a rota has been published."
        title="Allow editing after publish"
      >
        <RotaSettingSwitch
          checked={values.allowEditAfterPublish}
          label="Allow editing after publish"
          onCheckedChange={(checked) =>
            onUpdate({ allowEditAfterPublish: checked })
          }
        />
      </RotaSettingRow>
      <RotaSettingRow
        description="Ask for confirmation before removing an unassigned shift."
        title="Confirm before deleting shifts"
      >
        <RotaSettingSwitch
          checked={values.confirmShiftDelete}
          label="Confirm before deleting shifts"
          onCheckedChange={(checked) =>
            onUpdate({ confirmShiftDelete: checked })
          }
        />
      </RotaSettingRow>
    </RotaSettingsSection>
  )
}

export { RotaEditingSettingsSection }
