import { useState } from "react"
import { formatAttentionDate } from "../utils/date"
import { resolveArrivalSchema } from "../schemas"
import type { AttentionItem } from "../types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

function ArrivalResolutionDialog({
  item,
  pending,
  canResolve,
  onClose,
  onResolve,
}: {
  item: AttentionItem
  pending: boolean
  canResolve: boolean
  onClose: () => void
  onResolve: (reason: string) => void
}) {
  const [reason, setReason] = useState("")
  const reasonSchema = resolveArrivalSchema.shape.reason
  const parsedReason = reasonSchema.safeParse(reason)
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review unrecorded arrival</DialogTitle>
          <DialogDescription>
            {item.employeeName} · {item.locationName}
            <br />
            {formatAttentionDate(item.occurredAt, item.timeZone, new Date())}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{item.reason}</p>
        <p className="text-xs text-muted-foreground">
          Record what you confirmed with the employee. This saves an audited
          review; it does not create attendance or change payable hours. Correct
          clock records in timesheets when needed.
        </p>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (parsedReason.success && canResolve && !pending)
              onResolve(parsedReason.data)
          }}
        >
          <label className="block space-y-2 text-xs font-semibold">
            <span>Resolution reason</span>
            <Textarea
              required
              minLength={reasonSchema.minLength ?? undefined}
              maxLength={reasonSchema.maxLength ?? undefined}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="For example, confirmed the shift was cancelled."
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canResolve || pending || !parsedReason.success}
            >
              {pending ? "Saving…" : "Record resolution"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
export { ArrivalResolutionDialog }
