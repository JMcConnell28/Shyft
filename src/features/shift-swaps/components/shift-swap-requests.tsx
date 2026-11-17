import * as React from "react"

import type { BadgeVariant } from "@/components/panelui/badge"
import type {
  ShiftSwapRequestStatus,
  ShiftSwapRequestSummary,
  ShiftSwapShift,
} from "@/features/shift-swaps/types"
// eslint-disable-next-line no-duplicate-imports
import { Badge } from "@/components/panelui/badge"
import { DashboardCard } from "@/features/dashboard/components/dashboard-card"

const requestStatuses = {
  awaiting_peer: { label: "Awaiting response", variant: "outline" },
  open: { label: "Open", variant: "outline" },
  pending_manager: { label: "Pending approval", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  denied: { label: "Denied", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
  expired: { label: "Expired", variant: "secondary" },
} satisfies Record<
  ShiftSwapRequestStatus,
  { label: string; variant: BadgeVariant }
>

const cutoffFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
})

function RequestSection({
  children,
  count,
  emptyLabel,
  title,
}: {
  children: React.ReactNode
  count: number
  emptyLabel: string
  title: string
}) {
  const headingId = React.useId()

  return (
    <DashboardCard
      title={title}
      headingId={headingId}
      action={
        <Badge variant="secondary" size="sm">
          {count}
        </Badge>
      }
    >
      {count > 0 ? (
        <ul role="list" className="@container/requests divide-y divide-border">
          {children}
        </ul>
      ) : (
        <p className="p-4 text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </DashboardCard>
  )
}

function RequestRow({
  children,
  request,
}: {
  children?: React.ReactNode
  request: ShiftSwapRequestSummary
}) {
  const { label, variant } = requestStatuses[request.status]

  return (
    <li className="flex min-w-0 flex-col gap-3 px-4 py-3 @lg/requests:flex-row @lg/requests:items-start @lg/requests:justify-between">
      <div className="max-w-[44rem] min-w-0 flex-1 space-y-2 wrap-anywhere">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">
            {request.requestType === "swap" ? "Swap" : "Cover"}
          </span>
          <Badge variant={variant} size="sm">
            {label}
          </Badge>
        </div>
        <dl className="grid gap-x-6 gap-y-1.5 text-sm @min-[56rem]/requests:grid-cols-2">
          <ShiftLine label="From" shift={request.sourceShift} />
          {request.targetShift ? (
            <ShiftLine label="For" shift={request.targetShift} />
          ) : null}
        </dl>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{request.sourceShift.locationName}</span>
          <span className="tabular-nums">
            Cutoff{" "}
            <time dateTime={request.cutoffAt}>
              {cutoffFormatter.format(new Date(request.cutoffAt))}
            </time>
          </span>
        </div>
        {request.responder ? (
          <p className="text-sm text-muted-foreground">
            Cover offered by{" "}
            <span className="font-medium">{request.responder.name}</span>
          </p>
        ) : null}
        {request.managerNote ? (
          <p className="w-fit rounded-lg bg-muted/40 px-3 py-2 text-sm whitespace-pre-wrap text-muted-foreground">
            <span className="font-medium text-foreground">Manager note</span>
            <br />
            {request.managerNote}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="flex min-w-0 flex-wrap items-start gap-2 @lg/requests:shrink-0 @lg/requests:justify-end">
          {children}
        </div>
      ) : null}
    </li>
  )
}

function ShiftLine({ label, shift }: { label: string; shift: ShiftSwapShift }) {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-1">
      <dt className="text-xs leading-5 text-muted-foreground">{label}</dt>
      <dd>
        <span className="font-semibold">{shift.employeeName}</span>
        <span className="block text-xs text-muted-foreground tabular-nums">
          {shift.dateLabel}, {shift.timeLabel} · {shift.zoneName || "No zone"}
        </span>
      </dd>
    </div>
  )
}

export { RequestRow, RequestSection }
