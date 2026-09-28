import { queryOptions } from "@tanstack/react-query"
import {
  getOwnJoinRequest,
  listPendingJoinRequests,
} from "@/features/join-approvals/server-fns"

function ownJoinRequestQueryOptions(requestId: string) {
  return queryOptions({
    queryKey: ["join-requests", "mine", requestId],
    queryFn: () => getOwnJoinRequest({ data: { requestId } }),
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 15_000 : false,
  })
}

function pendingJoinRequestsQueryOptions(organizationId: string) {
  return queryOptions({
    queryKey: ["join-requests", "pending", organizationId],
    queryFn: () => listPendingJoinRequests({ data: { organizationId } }),
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export { ownJoinRequestQueryOptions, pendingJoinRequestsQueryOptions }
