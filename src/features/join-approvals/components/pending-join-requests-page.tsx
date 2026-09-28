"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { decideJoinRequest } from "@/features/join-approvals/server-fns"
import { pendingJoinRequestsQueryOptions } from "@/features/join-approvals/query-options"
import { getErrorMessage } from "@/lib/errors"

function PendingJoinRequestsPage({
  organizationId,
}: {
  organizationId: string
}) {
  const queryClient = useQueryClient()
  const requestsQuery = useQuery(
    pendingJoinRequestsQueryOptions(organizationId)
  )
  const decision = useMutation({
    mutationFn: (input: {
      requestId: string
      decision: "approved" | "denied"
    }) => decideJoinRequest({ data: { organizationId, ...input } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["join-requests", "pending", organizationId],
      })
      void queryClient.invalidateQueries({ queryKey: ["company"] })
    },
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Pending join requests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review employees who used a staff invite link. Approval gives them
          access to the organization and requested location.
        </p>
      </div>
      {requestsQuery.isPending ? (
        <p className="text-sm text-muted-foreground">Loading requests...</p>
      ) : requestsQuery.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(requestsQuery.error, "We could not load requests.")}
        </p>
      ) : requestsQuery.data.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            There are no pending join requests.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requestsQuery.data.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle className="text-base">{request.userName}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{request.userEmail}</p>
                  <p>
                    {request.locationName} · {request.staffGroupName}
                  </p>
                  <p>
                    Requested {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={decision.isPending}
                    onClick={() =>
                      decision.mutate({
                        requestId: request.id,
                        decision: "approved",
                      })
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={decision.isPending}
                    onClick={() =>
                      decision.mutate({
                        requestId: request.id,
                        decision: "denied",
                      })
                    }
                  >
                    Deny
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {decision.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(decision.error, "We could not review that request.")}
        </p>
      ) : null}
    </div>
  )
}

export { PendingJoinRequestsPage }
