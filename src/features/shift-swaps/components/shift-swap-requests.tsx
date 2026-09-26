import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

import type {
  ShiftSwapRequestStatus,
  ShiftSwapRequestSummary,
  ShiftSwapShift,
} from "@/features/shift-swaps/types"
import { Badge } from "@/components/ui/badge"
import {
  ShiftSwapPanel,
  ShiftSwapPanelHeader,
  ShiftSwapPill,
} from "@/features/shift-swaps/components/shift-swap-panel"
import { cn } from "@/lib/utils"

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
  return (
    <ShiftSwapPanel className="min-w-0">
      <ShiftSwapPanelHeader
        action={<ShiftSwapPill>{count}</ShiftSwapPill>}
        icon={icon}
        title={title}
      />
      <div className="p-4 sm:p-5">
        {count > 0 ? (
          <div className="grid gap-2">{children}</div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#dfe5f0] bg-[#fafbfe] px-4 py-7 text-center text-sm font-medium text-[#68769a]">
            {emptyLabel}
          </div>
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
    <article className="min-w-0 rounded-xl border border-[#dfe5f0] bg-white p-3.5 transition-colors hover:bg-[#fafcff] sm:p-4">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant={getStatusBadgeVariant(request.status)}
              className={cn(
                "rounded-lg px-2 py-0.5 text-[11px] font-semibold capitalize",
                getStatusBadgeClassName(request.status)
              )}
            >
              {request.status.replaceAll("_", " ")}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-lg border-[#dfe5f0] bg-[#fafbfe] px-2 py-0.5 text-[11px] font-semibold text-[#61709a] capitalize"
            >
              {request.requestType}
            </Badge>
            <span className="text-[11px] font-medium text-[#68769a]">
              Cutoff {formatDateTime(request.cutoffAt)}
            </span>
          </div>
          <ShiftLine label="From" shift={request.sourceShift} />
          {request.targetShift ? (
            <ShiftLine label="For" shift={request.targetShift} />
          ) : null}
          {request.responder ? (
            <p className="text-xs font-medium text-[#68769a]">
              Cover offered by {request.responder.name}
            </p>
          ) : null}
          {request.managerNote ? (
            <p className="rounded-lg bg-[#fafbfe] px-3 py-2 text-xs font-medium text-[#68769a]">
              {request.managerNote}
            </p>
          ) : null}
        </div>
        {children ? (
          <div className="flex min-w-0 shrink-0 flex-wrap gap-2 md:justify-end">
            {children}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function ShiftLine({ label, shift }: { label: string; shift: ShiftSwapShift }) {
  return (
    <p className="text-xs leading-relaxed font-medium text-[#11245a]">
      <span className="font-semibold text-[#68769a]">{label}</span>{" "}
      <span className="font-semibold">{shift.employeeName}</span>{" "}
      <span className="text-[#68769a]">
        - {shift.dateLabel}, {shift.timeLabel} - {shift.zoneName || "No zone"}
      </span>
    </p>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function getStatusBadgeVariant(status: ShiftSwapRequestStatus) {
  if (status === "approved") return "secondary" as const
  if (status === "denied" || status === "cancelled" || status === "expired") {
    return "destructive" as const
  }
  return "outline" as const
}

function getStatusBadgeClassName(status: ShiftSwapRequestStatus) {
  if (status === "approved")
    return "border-transparent bg-[#e7f8f1] text-[#248964]"
  if (status === "denied" || status === "cancelled" || status === "expired") {
    return "border-transparent bg-red-50 text-red-700"
  }
  if (status === "pending_manager") {
    return "border-transparent bg-amber-50 text-amber-700"
  }
  return "border-[#dfe5f0] bg-[#fafbfe] text-[#61709a]"
}

export { RequestCard, RequestSection }
