import { ArrowRightLeftIcon } from "lucide-react"

import {
  RotaSettingRow,
  RotaSettingSwitch,
} from "@/features/settings/components/rota-setting-row"
import { SettingsSection } from "@/features/settings/components/settings-section"

function ShiftSwapSettingsSection({
  enabled,
  isSaving,
  onChange,
}: {
  enabled: boolean
  isSaving: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <SettingsSection
      description="Control whether staff can request shift changes across this workspace."
      icon={ArrowRightLeftIcon}
      title="Shift swapping"
    >
      <RotaSettingRow
        description="When off, shift swaps are hidden from the sidebar and requests are unavailable."
        title="Allow shift swapping"
      >
        <div className="flex items-center gap-2">
          {isSaving ? (
            <span className="text-[10px] font-semibold text-[#7180a2]">
              Saving...
            </span>
          ) : null}
          <RotaSettingSwitch
            checked={enabled}
            disabled={isSaving}
            label="Allow shift swapping"
            onCheckedChange={onChange}
          />
        </div>
      </RotaSettingRow>
    </SettingsSection>
  )
}

export { ShiftSwapSettingsSection }
