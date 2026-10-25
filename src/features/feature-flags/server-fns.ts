import { createServerFn } from "@tanstack/react-start"
import { featureFlagLocationSchema } from "./schemas"

const getLocationFeatureAccess = createServerFn({ method: "POST" })
  .validator((input: unknown) => featureFlagLocationSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireVerifiedSessionOrThrow } =
      await import("@/features/onboarding/server/session")
    const { listPermittedRotaLocations } =
      await import("@/features/rota/server/access")
    const { getLocationOrganizationId } =
      await import("@/features/rota/server/lookups")
    const { getOrganizationRole } =
      await import("@/lib/auth/has-org-permission")
    const { getLocationRole } =
      await import("@/lib/auth/has-location-permission")
    const { getLocationFeatureFlags } = await import("./server/evaluation")
    const { session } = await requireVerifiedSessionOrThrow()
    const organizationId = await getLocationOrganizationId(data.locationId)
    const role = organizationId
      ? await getOrganizationRole(organizationId, session.user.id)
      : await getLocationRole(data.locationId, session.user.id)
    if (!role) throw new Error("You do not have access to that location.")
    const locations = await listPermittedRotaLocations(
      organizationId,
      session.user.id,
      role,
      data.locationId
    )
    if (!locations.some((location) => location.id === data.locationId))
      throw new Error("You do not have access to that location.")
    return getLocationFeatureFlags(data.locationId)
  })
export { getLocationFeatureAccess }
