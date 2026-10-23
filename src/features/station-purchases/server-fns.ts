import { createServerFn } from "@tanstack/react-start"
import { startStationPurchaseSchema, stationLocationSchema } from "./schemas"

const getStationPurchaseOptions = createServerFn({ method: "POST" })
  .validator((input: unknown) => stationLocationSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireVerifiedSessionOrThrow } =
      await import("@/features/onboarding/server/session")
    const { requireWorkspaceBillingPermission } =
      await import("@/features/billing/server/permissions")
    const { getPurchaseOptions } = await import("./server/queries")
    const { session } = await requireVerifiedSessionOrThrow()
    await requireWorkspaceBillingPermission({
      locationId: data.locationId,
      userId: session.user.id,
    })
    return getPurchaseOptions(data.locationId)
  })
const startStationPurchase = createServerFn({ method: "POST" })
  .validator((input: unknown) => startStationPurchaseSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireVerifiedSessionOrThrow } =
      await import("@/features/onboarding/server/session")
    const { requireWorkspaceBillingPermission } =
      await import("@/features/billing/server/permissions")
    const { createStationCheckout } = await import("./server/checkout")
    const { session } = await requireVerifiedSessionOrThrow()
    await requireWorkspaceBillingPermission({
      locationId: data.locationId,
      userId: session.user.id,
    })
    return createStationCheckout(data, session.user.id)
  })
export { getStationPurchaseOptions, startStationPurchase }
