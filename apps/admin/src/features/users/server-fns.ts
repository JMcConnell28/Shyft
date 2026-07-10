import { createServerFn } from "@tanstack/react-start"

import {
  createImpersonationSessionSchema,
  searchUsersSchema,
  updateAppUserStatusSchema,
} from "@/features/users/schemas"

const getUsers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => searchUsersSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { searchAppUsers } = await import("@/features/users/server/queries")

    await requireAdminPermission("users.manage")
    return searchAppUsers(data)
  })

const updateAppUserStatusServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateAppUserStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { updateAppUserStatus } = await import(
      "@/features/users/server/actions"
    )
    const { membership } = await requireAdminPermission("users.manage")

    await updateAppUserStatus({ ...data, adminUserId: membership.userId })
    return { success: true }
  })

const createImpersonationSessionServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    createImpersonationSessionSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { createReadOnlyImpersonationSession } = await import(
      "@/features/users/server/actions"
    )
    const { membership } = await requireAdminPermission("users.impersonate")

    return createReadOnlyImpersonationSession({
      ...data,
      adminUserId: membership.userId,
    })
  })

export {
  createImpersonationSessionServerFn,
  getUsers,
  updateAppUserStatusServerFn,
}
