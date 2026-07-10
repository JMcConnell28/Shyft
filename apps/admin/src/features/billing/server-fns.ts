import { createServerFn } from "@tanstack/react-start"

import { extendTrialSchema } from "@/features/billing/schemas"

const getBillingPageData = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { listBillingLocations } = await import(
      "@/features/billing/server/queries"
    )

    await requireAdminPermission("billing.trials.update")
    return listBillingLocations()
  },
)

const extendTrialServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => extendTrialSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { extendLocationTrial } = await import(
      "@/features/billing/server/actions"
    )
    const { membership } = await requireAdminPermission("billing.trials.update")

    return extendLocationTrial({ ...data, adminUserId: membership.userId })
  })

export { extendTrialServerFn, getBillingPageData }
