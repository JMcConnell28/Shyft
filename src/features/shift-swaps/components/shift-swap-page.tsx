"use client"

import {
  ArrowRightLeftIcon,
  CheckIcon,
  InboxIcon,
  SendIcon,
  XIcon,
} from "lucide-react"

import type {
  ShiftSwapPageData,
  ShiftSwapRequestStatus,
} from "@/features/shift-swaps/types"
import type { ShiftSwapScopeInput } from "@/features/shift-swaps/hooks/use-shift-swap-page-query"
import { Button } from "@/components/ui/button"
import { ManagerApprovalSection } from "@/features/shift-swaps/components/shift-swap-approvals"
import { ShiftSwapComposer } from "@/features/shift-swaps/components/shift-swap-composer"
import { ShiftSwapPill } from "@/features/shift-swaps/components/shift-swap-panel"
import {
  RequestCard,
  RequestSection,
} from "@/features/shift-swaps/components/shift-swap-requests"
import { useShiftSwapMutations } from "@/features/shift-swaps/hooks/use-shift-swap-mutations"
// eslint-disable-next-line no-duplicate-imports
import { useShiftSwapPageQuery } from "@/features/shift-swaps/hooks/use-shift-swap-page-query"

type ShiftSwapPageProps = ShiftSwapScopeInput & {
  initialData: ShiftSwapPageData
}

function ShiftSwapPage({ initialData, ...scope }: ShiftSwapPageProps) {
  const query = useShiftSwapPageQuery(scope, initialData)
  const data = query.data ?? initialData
  const mutations = useShiftSwapMutations(scope)
  const isCreating =
    mutations.createSwapMutation.isPending ||
    mutations.createCoverMutation.isPending
  const requestCount =
    data.incomingRequests.length +
    data.openCoverRequests.length +
    data.myRequests.length +
    data.managerRequests.length

  return (
    <main className="flex flex-1 bg-[#f6f8fc] px-4 py-5 text-[#10204b] sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[88rem] min-w-0 flex-col gap-4 sm:gap-5">
        <header className="flex animate-in flex-col gap-3 duration-500 fade-in slide-in-from-bottom-2 motion-reduce:animate-none sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl leading-none font-bold tracking-[-0.035em] sm:text-[1.75rem]">
              Shift swaps
            </h1>
            <p className="mt-2 text-sm font-medium text-[#68769a]">
              Request a swap, offer cover, and track your requests.
            </p>
          </div>
          <ShiftSwapPill className="w-fit">
            {requestCount} request{requestCount === 1 ? "" : "s"}
          </ShiftSwapPill>
        </header>

        <ShiftSwapComposer
          data={data}
          isCreating={isCreating}
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

        <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-2">
          <RequestSection
            count={data.incomingRequests.length}
            emptyLabel="No swap requests waiting for you."
            icon={InboxIcon}
            title="Requests for me"
          >
            {data.incomingRequests.map((request) => (
              <RequestCard key={request.id} request={request}>
                <Button
                  size="sm"
                  className="h-9 rounded-lg px-3 text-xs font-semibold"
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
                  <CheckIcon />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-lg border-[#dfe5f0] bg-white px-3 text-xs font-semibold text-[#11245a] shadow-none hover:bg-[#fbfcff]"
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
                  <XIcon />
                  Decline
                </Button>
              </RequestCard>
            ))}
          </RequestSection>

          <RequestSection
            count={data.openCoverRequests.length}
            emptyLabel="No open cover requests."
            icon={SendIcon}
            title="Open covers"
          >
            {data.openCoverRequests.map((request) => (
              <RequestCard key={request.id} request={request}>
                <Button
                  size="sm"
                  className="h-9 rounded-lg px-3 text-xs font-semibold"
                  disabled={
                    mutations.offerCoverMutation.isPending ||
                    request.status === "expired"
                  }
                  onClick={() =>
                    mutations.offerCoverMutation.mutate(request.id)
                  }
                >
                  Offer cover
                </Button>
              </RequestCard>
            ))}
          </RequestSection>
        </div>

        <RequestSection
          count={data.myRequests.length}
          emptyLabel="No shift swap or cover requests yet."
          icon={ArrowRightLeftIcon}
          title="My requests"
        >
          {data.myRequests.map((request) => (
            <RequestCard key={request.id} request={request}>
              {canCancel(request.status) ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-lg border-[#dfe5f0] bg-white px-3 text-xs font-semibold text-[#11245a] shadow-none hover:bg-[#fbfcff]"
                  disabled={mutations.cancelMutation.isPending}
                  onClick={() => mutations.cancelMutation.mutate(request.id)}
                >
                  Cancel
                </Button>
              ) : null}
            </RequestCard>
          ))}
        </RequestSection>

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
      </div>
    </main>
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
