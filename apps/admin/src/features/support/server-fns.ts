import { createServerFn } from "@tanstack/react-start"

import { updateSupportThreadStatusSchema } from "@/features/support/schemas"

const getSupportThreads = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { listSupportThreads } = await import(
      "@/features/support/server/queries"
    )

    await requireAdminPermission("support.manage")
    return listSupportThreads()
  },
)

const updateSupportThreadStatusServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateSupportThreadStatusSchema.parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { updateSupportThreadStatus } = await import(
      "@/features/support/server/actions"
    )
    const { membership } = await requireAdminPermission("support.manage")

    await updateSupportThreadStatus({ ...data, adminUserId: membership.userId })
    return { success: true }
  })

export { getSupportThreads, updateSupportThreadStatusServerFn }
