"use client"

import type {
  ShiftSwapPageData,
  ShiftSwapRequestStatus,
} from "@/features/shift-swaps/types"
import type { ShiftSwapScopeInput } from "@/features/shift-swaps/hooks/use-shift-swap-page-query"
import { useShiftSwapFlag } from "@/features/feature-flags/hooks/use-shift-swap-flag"
import { Button } from "@/components/ui/button"
import {
  DashboardLayout,
  DashboardPanel,
} from "@/features/dashboard/components/dashboard-layout"
import { ManagerApprovalSection } from "@/features/shift-swaps/components/shift-swap-approvals"
import { ShiftSwapComposer } from "@/features/shift-swaps/components/shift-swap-composer"
import {
  RequestRow,
  RequestSection,
} from "@/features/shift-swaps/components/shift-swap-requests"
import { useShiftSwapMutations } from "@/features/shift-swaps/hooks/use-shift-swap-mutations"
// eslint-disable-next-line no-duplicate-imports
import { useShiftSwapPageQuery } from "@/features/shift-swaps/hooks/use-shift-swap-page-query"

type ShiftSwapPageProps = ShiftSwapScopeInput & {
  initialData: ShiftSwapPageData
}

function ShiftSwapPage(props: ShiftSwapPageProps) {
  const enabled = useShiftSwapFlag(props.organizationId, props.userId, true)
  return (
    <DashboardLayout className="@container/shift-swaps max-w-[1440px] sm:gap-6 sm:pt-6">
      <header>
        <h1 className="text-2xl leading-8 font-bold tracking-tight">
          Shift swaps
        </h1>
      </header>
      {enabled ? (
        <ConnectedShiftSwapPage {...props} />
      ) : (
        <DashboardPanel>
          <p role="status" className="p-4 text-sm text-muted-foreground">
            Shift swaps are currently unavailable for your locations.
          </p>
        </DashboardPanel>
      )}
    </DashboardLayout>
  )
}

function ConnectedShiftSwapPage({ initialData, ...scope }: ShiftSwapPageProps) {
  const query = useShiftSwapPageQuery(scope, initialData)
  const data = query.data ?? initialData
  const mutations = useShiftSwapMutations(scope)
  return (
    <>
      {query.isError ? (
        <DashboardPanel className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <p role="alert" className="text-sm text-muted-foreground">
            Could not refresh requests. Showing the last available data.
          </p>
          <Button
            variant="secondary"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            Retry
          </Button>
        </DashboardPanel>
      ) : null}

      <ShiftSwapComposer
        data={data}
        isCreatingCover={mutations.createCoverMutation.isPending}
        isCreatingSwap={mutations.createSwapMutation.isPending}
        onCreateCover={(assignmentId) =>
          mutations.createCoverMutation.mutate(assignmentId)
        }
        onCreateSwap={(sourceAssignmentId, targetAssignmentId) =>
          mutations.createSwapMutation.mutate({
            sourceAssignmentId,
            targetAssignmentId,
          })
        }
      />

      <div className="grid items-start gap-4 sm:gap-6 @min-[52rem]/shift-swaps:grid-cols-2">
        <RequestSection
          count={data.incomingRequests.length}
          emptyLabel="No swap requests waiting for you."
          title="Requests for me"
        >
          {data.incomingRequests.map((request) => (
            <RequestRow key={request.id} request={request}>
              <Button
                variant="primary"
                disabled={
                  mutations.respondMutation.isPending ||
                  request.status === "expired"
                }
                onClick={() =>
                  mutations.respondMutation.mutate({
                    requestId: request.id,
                    decision: "accept",
                  })
                }
              >
                Accept
              </Button>
              <Button
                variant="secondary"
                disabled={
                  mutations.respondMutation.isPending ||
                  request.status === "expired"
                }
                onClick={() =>
                  mutations.respondMutation.mutate({
                    requestId: request.id,
                    decision: "decline",
                  })
                }
              >
                Decline
              </Button>
            </RequestRow>
          ))}
        </RequestSection>

        <RequestSection
          count={data.openCoverRequests.length}
          emptyLabel="No open cover requests."
          title="Open covers"
        >
          {data.openCoverRequests.map((request) => (
            <RequestRow key={request.id} request={request}>
              <Button
                variant="primary"
                disabled={
                  mutations.offerCoverMutation.isPending ||
                  request.status === "expired"
                }
                onClick={() => mutations.offerCoverMutation.mutate(request.id)}
              >
                Offer cover
              </Button>
            </RequestRow>
          ))}
        </RequestSection>
      </div>

      {data.canManage ? (
        <ManagerApprovalSection
          requests={data.managerRequests}
          isApproving={mutations.approveMutation.isPending}
          isDenying={mutations.denyMutation.isPending}
          onApprove={(requestId, note) =>
            mutations.approveMutation.mutate({ requestId, note })
          }
          onDeny={(requestId, note) =>
            mutations.denyMutation.mutate({ requestId, note })
          }
        />
      ) : null}

      <RequestSection
        count={data.myRequests.length}
        emptyLabel="No shift swap or cover requests yet."
        title="My requests"
      >
        {data.myRequests.map((request) => (
          <RequestRow key={request.id} request={request}>
            {canCancel(request.status) ? (
              <Button
                variant="secondary"
                disabled={mutations.cancelMutation.isPending}
                onClick={() => mutations.cancelMutation.mutate(request.id)}
              >
                Cancel
              </Button>
            ) : null}
          </RequestRow>
        ))}
      </RequestSection>
    </>
  )
}

function canCancel(status: ShiftSwapRequestStatus) {
  return (
    status === "awaiting_peer" ||
    status === "open" ||
    status === "pending_manager"
  )
}

export { ShiftSwapPage }
