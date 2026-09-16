import { MapPinnedIcon } from "lucide-react"

import type { GeneralSettingsLocation } from "@/features/settings/types"
import {
  WorkplaceReadOnlyValue,
  WorkplaceSettingRow,
} from "@/features/settings/components/workplace-setting-row"
import { WorkplaceSettingsSection } from "@/features/settings/components/workplace-settings-section"

function WorkplaceLocationsSection({
  locations,
}: {
  locations: Array<GeneralSettingsLocation>
}) {
  return (
    <WorkplaceSettingsSection
      description="Locations currently connected to this organisation."
      icon={MapPinnedIcon}
      title="Locations"
    >
      {locations.length > 0 ? (
        locations.map((location, index) => (
          <WorkplaceSettingRow
            description={`Location ${index + 1} of ${locations.length}`}
            key={location.id}
            title={location.name}
          >
            <WorkplaceReadOnlyValue value={location.slug} />
          </WorkplaceSettingRow>
        ))
      ) : (
        <div className="py-5 text-xs font-semibold text-[#7180a2]">
          No locations have been added yet.
        </div>
      )}
    </WorkplaceSettingsSection>
  )
}

export { WorkplaceLocationsSection }
