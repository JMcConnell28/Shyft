import { createServerFn } from "@tanstack/react-start"

import { extendTrialSchema } from "@/features/billing/schemas"
import { reviewPaymentRiskSchema } from "@/features/billing/schemas/payment-risk-schemas"

const getBillingPageData = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { listBillingLocations } =
      await import("@/features/billing/server/queries")

    await requireAdminPermission("billing.trials.update")
    return listBillingLocations()
  }
)

const extendTrialServerFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => extendTrialSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { extendLocationTrial } =
      await import("@/features/billing/server/actions")
    const { membership } = await requireAdminPermission("billing.trials.update")

    return extendLocationTrial({ ...data, adminUserId: membership.userId })
  })

const reviewPaymentRiskServerFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => reviewPaymentRiskSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { reviewPaymentRisk } =
      await import("@/features/billing/server/payment-risks")
    const { membership } = await requireAdminPermission("billing.risks.review")
    return reviewPaymentRisk(data, membership.userId)
  })

export { extendTrialServerFn, getBillingPageData, reviewPaymentRiskServerFn }
