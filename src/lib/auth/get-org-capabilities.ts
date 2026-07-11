import { getOrganizationRole } from "@/lib/auth/has-org-permission"
import { getOrgCapabilitiesForRole } from "@/lib/auth/workspace-capabilities"

// Keep the public type re-export without introducing a second runtime import.
/* eslint-disable @typescript-eslint/consistent-type-imports -- type-only compatibility re-export */
type OrganizationCapabilities =
  import("@/lib/auth/workspace-capabilities").OrganizationCapabilities
/* eslint-enable @typescript-eslint/consistent-type-imports */

async function getOrgCapabilities({
  organizationId,
  userId,
}: {
  organizationId: string
  userId: string
}) {
  const role = await getOrganizationRole(organizationId, userId)

  return getOrgCapabilitiesForRole(role)
}

export { getOrgCapabilities, getOrgCapabilitiesForRole }
export type { OrganizationCapabilities }
