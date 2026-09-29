import { createServerFn } from "@tanstack/react-start"

import {
  createSupportThreadSchema,
  replyToSupportThreadSchema,
  supportListSchema,
  supportScopeSchema,
  supportThreadIdSchema,
} from "@/features/support/schemas"

const listSupportThreads = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => supportListSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireCustomerSupportAccess } =
      await import("@/features/support/server/access")
    const { listCustomerSupportThreads } =
      await import("@/features/support/server/queries")
    const scope = await requireCustomerSupportAccess(data.organizationId)
    return listCustomerSupportThreads({ ...scope, page: data.page })
  })

const getSupportThread = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => supportThreadIdSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireCustomerSupportAccess } =
      await import("@/features/support/server/access")
    const { getCustomerSupportThread } =
      await import("@/features/support/server/queries")
    const scope = await requireCustomerSupportAccess(data.organizationId)
    return getCustomerSupportThread({ ...scope, threadId: data.threadId })
  })

const getSupportNotifications = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => supportScopeSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireCustomerSupportAccess } =
      await import("@/features/support/server/access")
    const { listCustomerSupportNotifications } =
      await import("@/features/support/server/queries")
    const scope = await requireCustomerSupportAccess(data.organizationId)
    return listCustomerSupportNotifications(scope)
  })

const createSupportThread = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => createSupportThreadSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireCustomerSupportAccess } =
      await import("@/features/support/server/access")
    const { createCustomerSupportThread } =
      await import("@/features/support/server/actions")
    const scope = await requireCustomerSupportAccess(data.organizationId)
    return createCustomerSupportThread({ ...data, ...scope })
  })

const replyToSupportThread = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => replyToSupportThreadSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireCustomerSupportAccess } =
      await import("@/features/support/server/access")
    const { replyToCustomerSupportThread } =
      await import("@/features/support/server/actions")
    const scope = await requireCustomerSupportAccess(data.organizationId)
    await replyToCustomerSupportThread({ ...data, ...scope })
    return { success: true }
  })

export {
  createSupportThread,
  getSupportNotifications,
  getSupportThread,
  listSupportThreads,
  replyToSupportThread,
}
