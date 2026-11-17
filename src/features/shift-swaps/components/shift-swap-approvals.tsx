import { useState } from "react"

import type { ShiftSwapRequestSummary } from "@/features/shift-swaps/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  RequestRow,
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
    >
      {requests.map((request) => (
        <RequestRow key={request.id} request={request}>
          <div className="grid w-full gap-2 @lg/requests:w-64">
            <label className="grid gap-1.5 text-sm font-medium">
              <span>
                Manager note{" "}
                <span className="text-muted-foreground">(optional)</span>
                <span className="sr-only">
                  {" "}
                  for {request.sourceShift.employeeName}
                </span>
              </span>
              <Textarea
                className="min-h-14 rounded-lg bg-card px-3 text-base md:text-sm dark:bg-card"
                maxLength={500}
                value={notes[request.id] ?? ""}
                onChange={(event) =>
                  setNotes((current) => ({
                    ...current,
                    [request.id]: event.target.value,
                  }))
                }
              />
            </label>
            <div className="flex flex-wrap gap-2 @lg/requests:justify-end">
              <Button
                variant="primary"
                disabled={isApproving || request.status === "expired"}
                onClick={() => onApprove(request.id, notes[request.id])}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                disabled={isDenying}
                onClick={() => onDeny(request.id, notes[request.id])}
              >
                Deny
              </Button>
            </div>
          </div>
        </RequestRow>
      ))}
    </RequestSection>
  )
}

export { ManagerApprovalSection }
