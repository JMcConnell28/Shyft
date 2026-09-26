import { useState } from "react"
import { ClipboardCheckIcon } from "lucide-react"

import type { ShiftSwapRequestSummary } from "@/features/shift-swaps/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  RequestCard,
  RequestSection,
} from "@/features/shift-swaps/components/shift-swap-requests"

type ManagerApprovalSectionProps = {
  isApproving: boolean
  isDenying: boolean
  onApprove: (requestId: string, note?: string) => void
  onDeny: (requestId: string, note?: string) => void
  requests: Array<ShiftSwapRequestSummary>
}

function ManagerApprovalSection({
  isApproving,
  isDenying,
  onApprove,
  onDeny,
  requests,
}: ManagerApprovalSectionProps) {
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
          <div className="grid w-full gap-2 md:w-64">
            <label className="sr-only" htmlFor={`manager-note-${request.id}`}>
              Manager note for {request.sourceShift.employeeName}
            </label>
            <Textarea
              id={`manager-note-${request.id}`}
              className="min-h-12 rounded-xl border-[#dfe5f0] bg-white text-xs text-[#11245a] shadow-none placeholder:text-[#9aa4bb]"
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
            <div className="flex gap-2 md:justify-end">
              <Button
                size="sm"
                className="h-9 rounded-lg px-3 text-xs font-semibold"
                disabled={isApproving || request.status === "expired"}
                onClick={() => onApprove(request.id, notes[request.id])}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-lg border-[#dfe5f0] bg-white px-3 text-xs font-semibold text-[#11245a] shadow-none hover:bg-[#fbfcff]"
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

export { ManagerApprovalSection }
