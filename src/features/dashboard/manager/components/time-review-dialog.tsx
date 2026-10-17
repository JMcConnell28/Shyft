import { Link } from "@tanstack/react-router"
import { formatAttentionDate, getDashboardWeekStart } from "../utils/date"
import type { AttentionItem } from "../types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TimeEntryNotes } from "@/features/time-clock/components/time-entry-notes"

function DashboardTimeReviewDialog({
  item,
  workspaceSlug,
  canApprove,
  pending,
  onApprove,
  onClose,
}: {
  item: AttentionItem
  workspaceSlug: string
  canApprove: boolean
  pending: boolean
  onApprove: () => void
  onClose: () => void
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review time entry</DialogTitle>
          <DialogDescription>
            {item.employeeName} · {item.locationName}
          </DialogDescription>
        </DialogHeader>
        <dl className="space-y-2 text-xs">
          <div>
            <dt className="font-semibold">Clocked in</dt>
            <dd>
              {formatAttentionDate(item.occurredAt, item.timeZone, new Date())}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Clocked out</dt>
            <dd>
              {item.clockedOutAt
                ? formatAttentionDate(
                    item.clockedOutAt,
                    item.timeZone,
                    new Date()
                  )
                : "Still open — no clock-out recorded"}
            </dd>
          </div>
        </dl>
        <TimeEntryNotes
          notes={item.reason}
          requiresReview={item.kind === "review"}
        />
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            nativeButton={false}
            variant="outline"
            className="h-9"
            render={
              <Link
                to="/app/$workspaceSlug/timesheets"
                params={{ workspaceSlug }}
                search={{
                  entryId: item.id,
                  weekStart: getDashboardWeekStart(item.workDate),
                }}
              />
            }
          >
            Correct in timesheets
          </Button>
          {item.kind === "review" ? (
            <Button
              className="h-9"
              disabled={!canApprove || pending}
              onClick={onApprove}
            >
              {pending ? "Approving…" : "Approve as recorded"}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
export { DashboardTimeReviewDialog }
