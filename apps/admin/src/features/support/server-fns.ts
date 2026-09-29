import { createServerFn } from "@tanstack/react-start"

import {
  replyToSupportThreadSchema,
  supportListSchema,
  supportThreadIdSchema,
  updateSupportThreadStatusSchema,
} from "@/features/support/schemas"

const getSupportThreads = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => supportListSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { listSupportThreads } =
      await import("@/features/support/server/queries")

    const { membership } = await requireAdminPermission("support.manage")
    return listSupportThreads(membership.userId, data.page)
  })

const getUnreadSupportCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { countUnreadSupportThreads } =
      await import("@/features/support/server/queries")
    const { membership } = await requireAdminPermission("support.manage")
    return countUnreadSupportThreads(membership.userId)
  }
)

const getSupportThread = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => supportThreadIdSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { getSupportThreadDetail } =
      await import("@/features/support/server/queries")
    const { membership } = await requireAdminPermission("support.manage")
    return getSupportThreadDetail(data.id, membership.userId)
  })

const replyToSupportThreadServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => replyToSupportThreadSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { replyToSupportThread } =
      await import("@/features/support/server/actions")
    const { membership } = await requireAdminPermission("support.manage")
    await replyToSupportThread({ ...data, adminUserId: membership.userId })
    return { success: true }
  })

const updateSupportThreadStatusServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateSupportThreadStatusSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const { requireAdminPermission } =
      await import("@/features/auth/server/admin-session")
    const { updateSupportThreadStatus } =
      await import("@/features/support/server/actions")
    const { membership } = await requireAdminPermission("support.manage")

    await updateSupportThreadStatus({ ...data, adminUserId: membership.userId })
    return { success: true }
  })

export {
  getSupportThread,
  getSupportThreads,
  getUnreadSupportCount,
  replyToSupportThreadServerFn,
  updateSupportThreadStatusServerFn,
}
