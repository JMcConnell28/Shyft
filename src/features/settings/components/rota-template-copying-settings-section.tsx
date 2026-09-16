import { FilesIcon } from "lucide-react"

import type { RotaSettingsValues } from "@/features/settings/types"
import {
  RotaSettingRow,
  RotaSettingSelect,
  RotaSettingValue,
} from "@/features/settings/components/rota-setting-row"
import { RotaSettingsSection } from "@/features/settings/components/rota-settings-section"

function RotaTemplateCopyingSettingsSection({
  onUpdate,
  templateCount,
  values,
}: {
  onUpdate: (patch: Partial<RotaSettingsValues>) => void
  templateCount: number
  values: RotaSettingsValues
}) {
  return (
    <RotaSettingsSection
      description="Set sensible defaults for reusable patterns and previous-week copies."
      icon={FilesIcon}
      title="Templates & copying"
    >
      <RotaSettingRow
        description="Choose which previous-week copy action appears first."
        title="Default copy action"
      >
        <RotaSettingSelect
          label="Default copy action"
          onChange={(value) =>
            onUpdate({ copyNotesByDefault: value === "full" })
          }
          options={[
            { label: "Full rota", value: "full" },
            { label: "Shifts only", value: "shifts-only" },
          ]}
          value={values.copyNotesByDefault ? "full" : "shifts-only"}
        />
      </RotaSettingRow>
      <RotaSettingRow
        description="Reusable weekly shift patterns saved for this location."
        title="Saved templates"
      >
        <RotaSettingValue>
          {templateCount} template{templateCount === 1 ? "" : "s"}
        </RotaSettingValue>
      </RotaSettingRow>
    </RotaSettingsSection>
  )
}

export { RotaTemplateCopyingSettingsSection }
