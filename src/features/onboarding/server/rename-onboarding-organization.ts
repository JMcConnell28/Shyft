import { createServerFn } from "@tanstack/react-start"

import { renameOnboardingOrganizationSchema } from "@/features/onboarding/schemas/onboarding-schemas"
import { organizationHasLocation } from "@/features/onboarding/server/organization-location-exists"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { auth } from "@/lib/auth"

const renameOnboardingOrganization = createServerFn({ method: "POST" })
  .validator(renameOnboardingOrganizationSchema)
  .handler(async ({ data }): Promise<{ name: string }> => {
    const { headers, session } = await requireVerifiedSessionOrThrow()
    const { organizationId, name } = data

    if (session.session.activeOrganizationId !== organizationId) {
      throw new Error(
        "Your active organisation changed. Refresh to continue setup."
      )
    }
    if (await organizationHasLocation(organizationId)) {
      throw new Error(
        "Workspace setup is already complete. Refresh to continue."
      )
    }

    const organization = await auth.api.updateOrganization({
      headers,
      body: { organizationId, data: { name } },
    })
    if (!organization) {
      throw new Error("We could not save your organisation name. Try again.")
    }

    return { name: organization.name }
  })

export { renameOnboardingOrganization }
