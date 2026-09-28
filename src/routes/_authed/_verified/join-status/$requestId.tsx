import { createFileRoute } from "@tanstack/react-router"
import { JoinRequestStatusPage } from "@/features/join-approvals/components/join-request-status-page"
import { ownJoinRequestQueryOptions } from "@/features/join-approvals/query-options"
import { listMyOrganizations } from "@/features/join-approvals/server-fns"

export const Route = createFileRoute(
  "/_authed/_verified/join-status/$requestId"
)({
  loader: async ({ context, params }) => {
    const [, organizations] = await Promise.all([
      context.queryClient.ensureQueryData(
        ownJoinRequestQueryOptions(params.requestId)
      ),
      listMyOrganizations(),
    ])
    return { organizations }
  },
  head: () => ({ meta: [{ title: "Join request | RocketRota" }] }),
  component: JoinRequestStatusRoute,
})

function JoinRequestStatusRoute() {
  const { requestId } = Route.useParams()
  const { organizations } = Route.useLoaderData()
  return (
    <JoinRequestStatusPage
      requestId={requestId}
      organizations={organizations}
    />
  )
}
