import { createServerFn } from "@tanstack/react-start"

import {
  billingWorkspaceSchema,
  removeOrganizationSchema,
} from "@/features/billing/schemas/workspace-closure-schemas"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"

const cancelOrganizationSubscription = createServerFn({ method: "POST" })
  .validator(billingWorkspaceSchema)
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()
    const { cancelSubscriptionAsOwner } = await import("./workspace-closure")
    return cancelSubscriptionAsOwner(data.organizationId, session.user.id)
  })

const removeOrganization = createServerFn({ method: "POST" })
  .validator(removeOrganizationSchema)
  .handler(async ({ data }) => {
    const { session } = await requireVerifiedSessionOrThrow()
    const { removeOrganizationAsOwner } = await import("./workspace-closure")
    await removeOrganizationAsOwner({ ...data, userId: session.user.id })
    return { success: true }
  })

export { cancelOrganizationSubscription, removeOrganization }
