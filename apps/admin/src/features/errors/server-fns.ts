import { createServerFn } from "@tanstack/react-start"

import { updateErrorStatusSchema } from "@/features/errors/schemas"

const getErrors = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdminPermission } = await import(
    "@/features/auth/server/admin-session"
  )
  const { listErrorReports } = await import("@/features/errors/server/queries")

  await requireAdminPermission("errors.manage")
  return listErrorReports()
})

const updateErrorStatusServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => updateErrorStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { updateErrorStatus } = await import("@/features/errors/server/actions")
    const { membership } = await requireAdminPermission("errors.manage")

    await updateErrorStatus({ ...data, adminUserId: membership.userId })
    return { success: true }
  })

export { getErrors, updateErrorStatusServerFn }
