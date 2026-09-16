import { requireLocationPermission } from "@/lib/auth/has-location-permission"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

type RotaSettingsScope = {
  organizationId?: string
  locationId?: string
  userId: string
}

async function requireRotaSettingsPermission(input: RotaSettingsScope) {
  if (input.organizationId) {
    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: input.userId,
      permissions: {
        rota: ["update"],
      },
      errorMessage: "You do not have permission to manage rota settings.",
    })
    return
  }

  if (!input.locationId) {
    throw new Error("Choose a location.")
  }

  await requireLocationPermission({
    locationId: input.locationId,
    userId: input.userId,
    permissions: {
      rota: ["update"],
    },
    errorMessage: "You do not have permission to manage rota settings.",
  })
}

export { requireRotaSettingsPermission }
export type { RotaSettingsScope }
