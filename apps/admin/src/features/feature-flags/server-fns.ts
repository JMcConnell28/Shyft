import { createServerFn } from "@tanstack/react-start"

import {
  createFeatureFlagSchema,
  updateFeatureFlagSchema,
} from "@/features/feature-flags/schemas/feature-flag-schemas"

const getFeatureFlags = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdminPermission } = await import(
    "@/features/auth/server/admin-session"
  )
  const { listFeatureFlags } = await import(
    "@/features/feature-flags/server/queries"
  )

  await requireAdminPermission("feature_flags.manage")
  return listFeatureFlags()
})

const createFeatureFlagServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createFeatureFlagSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { createFeatureFlag } = await import(
      "@/features/feature-flags/server/actions"
    )
    const { membership } = await requireAdminPermission("feature_flags.manage")

    return createFeatureFlag({
      ...data,
      adminUserId: membership.userId,
    })
  })

const updateFeatureFlagServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateFeatureFlagSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { updateFeatureFlag } = await import(
      "@/features/feature-flags/server/actions"
    )
    const { membership } = await requireAdminPermission("feature_flags.manage")

    return updateFeatureFlag({
      ...data,
      adminUserId: membership.userId,
    })
  })

export { createFeatureFlagServerFn, getFeatureFlags, updateFeatureFlagServerFn }
