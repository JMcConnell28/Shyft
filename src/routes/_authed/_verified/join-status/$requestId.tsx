import { createFileRoute } from "@tanstack/react-router"
import { JoinRequestStatusPage } from "@/features/join-approvals/components/join-request-status-page"
import { ownJoinRequestQueryOptions } from "@/features/join-approvals/query-options"

export const Route = createFileRoute(
  "/_authed/_verified/join-status/$requestId"
)({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      ownJoinRequestQueryOptions(params.requestId)
    ),
  head: () => ({ meta: [{ title: "Join request | RocketRota" }] }),
  component: JoinRequestStatusRoute,
})

function JoinRequestStatusRoute() {
  const { requestId } = Route.useParams()
  return <JoinRequestStatusPage requestId={requestId} />
}
