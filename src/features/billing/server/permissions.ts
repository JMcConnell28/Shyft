import "@tanstack/react-start/server-only"

import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getOrganizationRole } from "@/lib/auth/has-org-permission"

const billingManagerRoles = new Set(["owner", "admin"])

type BillingPermissionInput = {
  organizationId?: string
  locationId?: string
  userId: string
}

async function requireWorkspaceBillingPermission(input: BillingPermissionInput) {
  const role = input.organizationId
    ? await getOrganizationRole(input.organizationId, input.userId)
    : input.locationId
      ? await getLocationRole(input.locationId, input.userId)
      : null

  if (!role || !billingManagerRoles.has(role)) {
    throw new Error("You do not have permission to manage billing.")
  }

  return role
}

export { requireWorkspaceBillingPermission }
