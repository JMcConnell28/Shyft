import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

type CompanyScope = {
  locationId: string | null
  organizationId: string | null
  userId: string
}

async function requireCompanyAdminContext(input: {
  organizationId?: string
  locationId?: string
  userId: string
}): Promise<CompanyScope> {
  const { session } = await requireVerifiedSessionOrThrow()

  if (session.user.id !== input.userId) {
    throw new Error(
      "Your workspace session is no longer valid. Refresh and try again."
    )
  }

  if (input.organizationId) {
    if (session.session.activeOrganizationId !== input.organizationId) {
      throw new Error(
        "Your workspace session is no longer valid. Refresh and try again."
      )
    }

    await requireOrgPermission({
      organizationId: input.organizationId,
      userId: session.user.id,
      permissions: {
        member: ["update"],
      },
      errorMessage: "You do not have permission to manage company staff.",
    })

    return {
      locationId: null,
      organizationId: input.organizationId,
      userId: session.user.id,
    }
  }

  if (!input.locationId) {
    throw new Error("Choose a location.")
  }

  await requireLocationPermission({
    locationId: input.locationId,
    userId: session.user.id,
    permissions: {
      location: ["update"],
    },
    errorMessage: "You do not have permission to manage company staff.",
  })

  return {
    locationId: input.locationId,
    organizationId: null,
    userId: session.user.id,
  }
}

export { requireCompanyAdminContext }
export type { CompanyScope }
