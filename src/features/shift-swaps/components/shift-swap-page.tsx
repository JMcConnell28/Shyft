"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  ArrowRightLeftIcon,
  CheckIcon,
  ClipboardCheckIcon,
  InboxIcon,
  LoaderCircleIcon,
  SendIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import {
  ShiftSwapPanel,
  ShiftSwapPanelHeader,
  ShiftSwapPill,
} from "@/features/shift-swaps/components/shift-swap-panel"
import { useShiftSwapMutations } from "@/features/shift-swaps/hooks/use-shift-swap-mutations"
import {
  useShiftSwapPageQuery,
  type ShiftSwapScopeInput,
} from "@/features/shift-swaps/hooks/use-shift-swap-page-query"
import type {
  ShiftSwapPageData,
  ShiftSwapRequestStatus,
  ShiftSwapRequestSummary,
  ShiftSwapShift,
} from "@/features/shift-swaps/types"
import { cn } from "@/lib/utils"

type ShiftSwapPageProps = ShiftSwapScopeInput & {
  initialData: ShiftSwapPageData
}

function ShiftSwapPage({ initialData, ...scope }: ShiftSwapPageProps) {
  const query = useShiftSwapPageQuery(scope, initialData)
  const data = query.data ?? initialData
  const mutations = useShiftSwapMutations(scope)
  const [selectedRotaId, setSelectedRotaId] = useState(data.rotas[0]?.id ?? "")
  const [sourceAssignmentId, setSourceAssignmentId] = useState("")
  const [targetAssignmentId, setTargetAssignmentId] = useState("")

  const ownRotaShifts = useMemo(
    () => data.ownShifts.filter((shift) => shift.rotaId === selectedRotaId),
    [data.ownShifts, selectedRotaId]
  )
  const sourceShift = data.ownShifts.find(
    (shift) => shift.assignmentId === sourceAssignmentId
  )
  const targetShifts = useMemo(() => {
    if (!sourceShift) {
      return []
    }

    return data.swapTargetShifts.filter(
      (shift) =>
        shift.rotaId === sourceShift.rotaId &&
        shift.locationId === sourceShift.locationId &&
        shift.staffGroupId === sourceShift.staffGroupId &&
        shift.employeeId !== sourceShift.employeeId
    )
  }, [data.swapTargetShifts, sourceShift])

  useEffect(() => {
    if (!selectedRotaId && data.rotas[0]) {
      setSelectedRotaId(data.rotas[0].id)
    }
  }, [data.rotas, selectedRotaId])

  useEffect(() => {
    if (
      !ownRotaShifts.some((shift) => shift.assignmentId === sourceAssignmentId)
    ) {
      setSourceAssignmentId(ownRotaShifts[0]?.assignmentId ?? "")
    }
  }, [ownRotaShifts, sourceAssignmentId])

  useEffect(() => {
    if (
      !targetShifts.some((shift) => shift.assignmentId === targetAssignmentId)
    ) {
      setTargetAssignmentId(targetShifts[0]?.assignmentId ?? "")
    }
  }, [targetShifts, targetAssignmentId])

  const isCreating =
    mutations.createSwapMutation.isPending ||
    mutations.createCoverMutation.isPending
  const openRequestCount =
    data.incomingRequests.length +
    data.openCoverRequests.length +
    data.myRequests.length +
    data.managerRequests.length

  return (
    <div className="flex flex-1 flex-col gap-5 bg-[#f7f8fb] p-4 text-[#11245a] sm:p-5">
      <ShiftSwapPanel>
        <ShiftSwapPanelHeader
          action={
            <ShiftSwapPill>
              {openRequestCount} request{openRequestCount === 1 ? "" : "s"}
            </ShiftSwapPill>
          }
          icon={ArrowRightLeftIcon}
          subtitle="Request a swap or put one of your shifts up for cover"
          title="Shift swaps"
        />
        <div className="grid gap-3 p-4 lg:grid-cols-[minmax(10rem,0.8fr)_minmax(14rem,1fr)_minmax(14rem,1fr)_auto] lg:items-end">
          <Field label="Rota">
            <NativeSelect
              className="w-full border-[#dfe5f0] bg-white text-[#11245a] shadow-none"
              value={selectedRotaId}
              onChange={(event) => setSelectedRotaId(event.target.value)}
            >
              {data.rotas.length === 0 ? (
                <NativeSelectOption value="">
                  No published rotas
                </NativeSelectOption>
              ) : null}
              {data.rotas.map((rota) => (
                <NativeSelectOption key={rota.id} value={rota.id}>
                  {rota.weekLabel} - {rota.locationName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Your shift">
            <ShiftSelect
              emptyLabel="No eligible shifts"
              shifts={ownRotaShifts}
              value={sourceAssignmentId}
              onChange={setSourceAssignmentId}
            />
          </Field>
          <Field label="Swap with">
            <ShiftSelect
              emptyLabel="No matching shifts"
              shifts={targetShifts}
              value={targetAssignmentId}
              onChange={setTargetAssignmentId}
            />
          </Field>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Button
              size="sm"
              className="h-9 rounded-[10px] font-semibold"
              disabled={
                !sourceAssignmentId || !targetAssignmentId || isCreating
              }
              onClick={() =>
                mutations.createSwapMutation.mutate({
                  sourceAssignmentId,
                  targetAssignmentId,
                })
              }
            >
              {isCreating ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : null}
              Request swap
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-[10px] border-[#dfe5f0] bg-white font-semibold text-[#11245a] shadow-none hover:bg-[#fbfcff]"
              disabled={!sourceAssignmentId || isCreating}
              onClick={() =>
                mutations.createCoverMutation.mutate(sourceAssignmentId)
              }
            >
              Put up for cover
            </Button>
          </div>
        </div>
      </ShiftSwapPanel>

      <div className="grid gap-4 xl:grid-cols-2">
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
                className="h-8 rounded-[9px] px-3 text-xs font-semibold"
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
                className="h-8 rounded-[9px] border-[#dfe5f0] bg-white px-3 text-xs font-semibold text-[#11245a] shadow-none hover:bg-[#fbfcff]"
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
                className="h-8 rounded-[9px] px-3 text-xs font-semibold"
                disabled={
                  mutations.offerCoverMutation.isPending ||
                  request.status === "expired"
                }
                onClick={() => mutations.offerCoverMutation.mutate(request.id)}
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
                className="h-8 rounded-[9px] border-[#dfe5f0] bg-white px-3 text-xs font-semibold text-[#11245a] shadow-none hover:bg-[#fbfcff]"
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
  )
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="grid gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#7a86a4] uppercase">
      {label}
      {children}
    </label>
  )
}

function ShiftSelect({
  emptyLabel,
  onChange,
  shifts,
  value,
}: {
  emptyLabel: string
  onChange: (value: string) => void
  shifts: ShiftSwapShift[]
  value: string
}) {
  return (
    <NativeSelect
      className="w-full border-[#dfe5f0] bg-white text-[#11245a] shadow-none"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {shifts.length === 0 ? (
        <NativeSelectOption value="">{emptyLabel}</NativeSelectOption>
      ) : null}
      {shifts.map((shift) => (
        <NativeSelectOption key={shift.assignmentId} value={shift.assignmentId}>
          {formatShiftOption(shift)}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}

function RequestSection({
  children,
  count,
  emptyLabel,
  icon,
  title,
}: {
  children: ReactNode
  count: number
  emptyLabel: string
  icon: LucideIcon
  title: string
}) {
  const hasItems = Array.isArray(children)
    ? children.length > 0
    : Boolean(children)

  return (
    <ShiftSwapPanel className="h-fit">
      <ShiftSwapPanelHeader
        action={
          <ShiftSwapPill>
            {count} item{count === 1 ? "" : "s"}
          </ShiftSwapPill>
        }
        icon={icon}
        title={title}
      />
      <div className="p-4">
        {hasItems ? (
          <div className="grid gap-2">{children}</div>
        ) : (
          <EmptyState label={emptyLabel} />
        )}
      </div>
    </ShiftSwapPanel>
  )
}

function RequestCard({
  children,
  request,
}: {
  children?: ReactNode
  request: ShiftSwapRequestSummary
}) {
  return (
    <article className="rounded-[12px] border border-[#dfe5f0] bg-white p-3 shadow-[0_4px_14px_rgba(30,50,96,0.025)] transition-colors hover:bg-[#fbfcff]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant={getStatusBadgeVariant(request.status)}
              className={cn(
                "rounded-[8px] px-2 py-0.5 text-[11px] font-semibold capitalize",
                getStatusBadgeClassName(request.status)
              )}
            >
              {formatStatus(request.status)}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-[8px] border-[#dfe5f0] bg-[#fbfcff] px-2 py-0.5 text-[11px] font-semibold text-[#61709a]"
            >
              {request.requestType}
            </Badge>
            <span className="text-[11px] font-medium text-[#7a86a4]">
              Cutoff {formatDateTime(request.cutoffAt)}
            </span>
          </div>
          <ShiftLine label="From" shift={request.sourceShift} />
          {request.targetShift ? (
            <ShiftLine label="For" shift={request.targetShift} />
          ) : null}
          {request.responder ? (
            <p className="text-xs font-medium text-[#7a86a4]">
              Cover offered by {request.responder.name}
            </p>
          ) : null}
          {request.managerNote ? (
            <p className="rounded-[10px] border border-[#edf0f6] bg-[#fbfcff] px-3 py-2 text-xs font-medium text-[#7a86a4]">
              {request.managerNote}
            </p>
          ) : null}
        </div>
        {children ? (
          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            {children}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function ManagerApprovalSection({
  isApproving,
  isDenying,
  onApprove,
  onDeny,
  requests,
}: {
  isApproving: boolean
  isDenying: boolean
  onApprove: (requestId: string, note?: string) => void
  onDeny: (requestId: string, note?: string) => void
  requests: ShiftSwapRequestSummary[]
}) {
  const [notes, setNotes] = useState<Record<string, string>>({})

  return (
    <RequestSection
      count={requests.length}
      title="Manager approvals"
      emptyLabel="No shift changes waiting for approval."
      icon={ClipboardCheckIcon}
    >
      {requests.map((request) => (
        <RequestCard key={request.id} request={request}>
          <div className="grid w-full gap-2 sm:w-64">
            <Textarea
              className="min-h-12 rounded-[10px] border-[#dfe5f0] bg-white text-xs text-[#11245a] shadow-none placeholder:text-[#9aa4bb]"
              maxLength={500}
              placeholder="Manager note"
              value={notes[request.id] ?? ""}
              onChange={(event) =>
                setNotes((current) => ({
                  ...current,
                  [request.id]: event.target.value,
                }))
              }
            />
            <div className="flex gap-2 sm:justify-end">
              <Button
                size="sm"
                className="h-8 rounded-[9px] px-3 text-xs font-semibold"
                disabled={isApproving || request.status === "expired"}
                onClick={() => onApprove(request.id, notes[request.id])}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-[9px] border-[#dfe5f0] bg-white px-3 text-xs font-semibold text-[#11245a] shadow-none hover:bg-[#fbfcff]"
                disabled={isDenying}
                onClick={() => onDeny(request.id, notes[request.id])}
              >
                Deny
              </Button>
            </div>
          </div>
        </RequestCard>
      ))}
    </RequestSection>
  )
}

function ShiftLine({ label, shift }: { label: string; shift: ShiftSwapShift }) {
  return (
    <p className="truncate text-xs font-medium text-[#11245a]">
      <span className="font-semibold text-[#7a86a4]">{label}</span>{" "}
      <span className="font-semibold">{shift.employeeName}</span>{" "}
      <span className="text-[#7a86a4]">
        - {shift.dateLabel}, {shift.timeLabel} - {shift.zoneName || "No zone"}
      </span>
    </p>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-[12px] border border-dashed border-[#dfe5f0] bg-[#fbfcff] px-4 py-7 text-center text-sm font-medium text-[#7a86a4]">
      {label}
    </div>
  )
}

function formatShiftOption(shift: ShiftSwapShift) {
  return `${shift.employeeName} - ${shift.dateLabel}, ${shift.timeLabel} - ${
    shift.zoneName || "No zone"
  }`
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatStatus(status: ShiftSwapRequestStatus) {
  return status.replaceAll("_", " ")
}

function canCancel(status: ShiftSwapRequestStatus) {
  return (
    status === "awaiting_peer" ||
    status === "open" ||
    status === "pending_manager"
  )
}

function getStatusBadgeVariant(status: ShiftSwapRequestStatus) {
  if (status === "approved") {
    return "secondary" as const
  }

  if (status === "denied" || status === "cancelled" || status === "expired") {
    return "destructive" as const
  }

  return "outline" as const
}

function getStatusBadgeClassName(status: ShiftSwapRequestStatus) {
  if (status === "approved") {
    return "border-transparent bg-[#e7f8f1] text-[#248964]"
  }

  if (status === "denied" || status === "cancelled" || status === "expired") {
    return "border-transparent bg-red-50 text-red-700"
  }

  if (status === "pending_manager") {
    return "border-transparent bg-amber-50 text-amber-700"
  }

  return "border-[#dfe5f0] bg-[#fbfcff] text-[#61709a]"
}

export { ShiftSwapPage }
