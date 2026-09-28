import { createServerFn } from "@tanstack/react-start"
import {
  decideJoinRequestSchema,
  joinRequestIdSchema,
  organizationJoinRequestsSchema,
} from "@/features/join-approvals/schemas"

const getOwnJoinRequest = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => joinRequestIdSchema.parse(input))
  .handler(async ({ data }) => {
    const queries = await import("@/features/join-approvals/server/queries")
    return queries.getOwnJoinRequest(data.requestId)
  })

const listOwnJoinRequests = createServerFn({ method: "GET" }).handler(
  async () => {
    const queries = await import("@/features/join-approvals/server/queries")
    return queries.listOwnJoinRequests()
  }
)

const listMyOrganizations = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requireVerifiedSessionOrThrow, listOrganizationsForHeaders } =
      await import("@/features/onboarding/server/session")
    const { headers } = await requireVerifiedSessionOrThrow()
    return listOrganizationsForHeaders(headers)
  }
)

const listPendingJoinRequests = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    organizationJoinRequestsSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const queries = await import("@/features/join-approvals/server/queries")
    return queries.listPendingJoinRequests(data.organizationId)
  })

const decideJoinRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => decideJoinRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const actions = await import("@/features/join-approvals/server/actions")
    await actions.decideStaffJoinRequest(data)
    return { success: true }
  })

export {
  decideJoinRequest,
  getOwnJoinRequest,
  listOwnJoinRequests,
  listMyOrganizations,
  listPendingJoinRequests,
}
