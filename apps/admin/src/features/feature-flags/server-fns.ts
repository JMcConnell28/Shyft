import { createServerFn } from "@tanstack/react-start"
import {
  flagDetailsSchema,
  flagKeySchema,
  flagLocationSchema,
  updateFeatureFlagSchema,
  updateLocationFlagSchema,
} from "./schemas/feature-flag-schemas"

const getFeatureFlags = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdminPermission } =
    await import("@/features/auth/server/admin-session")
  await requireAdminPermission("feature_flags.manage")
  const { listFeatureFlags } = await import("./server/queries")
  return listFeatureFlags()
})
const getLocationFlags = createServerFn({ method: "POST" })
  .validator((input: unknown) => flagLocationSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    await requireAdminPermission("feature_flags.manage")
    const { getLocationFlagSettings } = await import("./server/queries")
    return getLocationFlagSettings(data.locationId)
  })
const getFeatureFlagLocations = createServerFn({ method: "POST" })
  .validator((input: unknown) => flagDetailsSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    await requireAdminPermission("feature_flags.manage")
    const { getFlagLocations } = await import("./server/queries")
    return getFlagLocations(data)
  })
const getFeatureFlagHistory = createServerFn({ method: "POST" })
  .validator((input: unknown) => flagKeySchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    await requireAdminPermission("feature_flags.manage")
    const { getFlagHistory } = await import("./server/history-query")
    return getFlagHistory(data)
  })
const updateFeatureFlagServerFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateFeatureFlagSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { membership } = await requireAdminPermission("feature_flags.manage")
    const { changeFeatureFlag } = await import("./server/actions")
    return changeFeatureFlag(data, membership.userId)
  })
const updateLocationFlagServerFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateLocationFlagSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { membership } = await requireAdminPermission("feature_flags.manage")
    const { changeFeatureFlag } = await import("./server/actions")
    return changeFeatureFlag(data, membership.userId)
  })
export {
  getFeatureFlags,
  getLocationFlags,
  getFeatureFlagLocations,
  getFeatureFlagHistory,
  updateFeatureFlagServerFn,
  updateLocationFlagServerFn,
}
