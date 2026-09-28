import * as React from "react"
import { useServerFn } from "@tanstack/react-start"

import type { OrganizationSummary } from "@/features/onboarding/types"
import { activateOrganization } from "@/lib/onboarding"
import { getWorkspaceDashboardPath } from "@/lib/organization-paths"
import { showErrorToast } from "@/lib/toast"

function useOrganizationSwitch(organizations: Array<OrganizationSummary>) {
  const activateOrganizationFn = useServerFn(activateOrganization)
  const [switchingId, setSwitchingId] = React.useState<string | null>(null)

  async function switchOrganization(organizationId: string): Promise<void> {
    const organization = organizations.find(
      (entry) => entry.id === organizationId
    )
    if (!organization || switchingId) return

    setSwitchingId(organizationId)
    try {
      await activateOrganizationFn({ data: { organizationId } })
      window.location.assign(getWorkspaceDashboardPath(organization.slug))
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "We could not switch organizations.",
      })
      setSwitchingId(null)
    }
  }

  return { switchingId, switchOrganization }
}

export { useOrganizationSwitch }
