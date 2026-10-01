import { Building2Icon } from "lucide-react"
import type { OrganizationSummary } from "@/features/onboarding/types"
import { OrganizationSwitcherList } from "@/features/navigation/components/organization-switcher-list"
import { SettingsSection } from "@/features/settings/components/settings-section"

function AccountOrganizationsSection({
  organizations,
  activeOrganizationId,
}: {
  organizations: Array<OrganizationSummary>
  activeOrganizationId: string | null
}) {
  return (
    <SettingsSection
      title="Organisations"
      icon={Building2Icon}
      description="Choose which organisation you are viewing."
    >
      <div className="py-3">
        <OrganizationSwitcherList
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
        />
      </div>
    </SettingsSection>
  )
}

export { AccountOrganizationsSection }
