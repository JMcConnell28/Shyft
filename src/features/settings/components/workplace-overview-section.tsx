import { Building2Icon } from "lucide-react"

import {
  WorkplaceReadOnlyValue,
  WorkplaceSettingRow,
} from "@/features/settings/components/workplace-setting-row"
import { WorkplaceSettingsSection } from "@/features/settings/components/workplace-settings-section"

function WorkplaceOverviewSection({
  organizationName,
}: {
  organizationName: string
}) {
  return (
    <WorkplaceSettingsSection
      description="The organisation this workspace belongs to."
      icon={Building2Icon}
      title="Workplace"
    >
      <WorkplaceSettingRow
        description="Shown throughout RocketRota and staff communications."
        title="Organisation name"
      >
        <WorkplaceReadOnlyValue value={organizationName} />
      </WorkplaceSettingRow>
    </WorkplaceSettingsSection>
  )
}

export { WorkplaceOverviewSection }
