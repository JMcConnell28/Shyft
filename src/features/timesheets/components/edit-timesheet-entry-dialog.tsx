"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { TimesheetEntry, TimesheetScopeInput } from "@/features/timesheets/types"
import { useTimesheetMutations } from "@/features/timesheets/hooks/use-timesheet-mutations"

function EditTimesheetEntryDialog({
  entry,
  input,
  onOpenChange,
}: {
  entry: TimesheetEntry | null
  input: TimesheetScopeInput
  onOpenChange: (open: boolean) => void
}) {
  const { updateEntryMutation } = useTimesheetMutations(input)
  const [clockedInAt, setClockedInAt] = React.useState("")
  const [clockedOutAt, setClockedOutAt] = React.useState("")
  const [payableStartAt, setPayableStartAt] = React.useState("")
  const [payableEndAt, setPayableEndAt] = React.useState("")
  const [reason, setReason] = React.useState("")
  const [status, setStatus] = React.useState<"open" | "closed" | "requires_review">(
    "closed",
  )

  React.useEffect(() => {
    setClockedInAt(toDateTimeLocal(entry?.clockedInAt))
    setClockedOutAt(toDateTimeLocal(entry?.clockedOutAt))
    setPayableStartAt(toDateTimeLocal(entry?.payableStartAt))
    setPayableEndAt(toDateTimeLocal(entry?.payableEndAt))
    setStatus(entry?.status === "scheduled" ? "closed" : entry?.status ?? "closed")
    setReason("")
  }, [entry])

  const canSubmit =
    Boolean(entry?.id) &&
    clockedInAt.length > 0 &&
    payableStartAt.length > 0 &&
    reason.trim().length >= 5

  return (
    <Dialog open={Boolean(entry)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit time entry</DialogTitle>
          <DialogDescription>
            Changes are audited and saved as a manager adjustment.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <TimeField
            label="Clocked in"
            value={clockedInAt}
            onChange={setClockedInAt}
          />
          <TimeField
            label="Clocked out"
            value={clockedOutAt}
            onChange={setClockedOutAt}
          />
          <TimeField
            label="Payable start"
            value={payableStartAt}
            onChange={setPayableStartAt}
          />
          <TimeField
            label="Payable end"
            value={payableEndAt}
            onChange={setPayableEndAt}
          />
        </div>

        <label className="space-y-1 text-xs font-medium">
          <span>Status</span>
          <select
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "open" | "closed" | "requires_review")
            }
          >
            <option value="closed">Closed</option>
            <option value="requires_review">Requires review</option>
            <option value="open">Open</option>
          </select>
        </label>

        <label className="space-y-1 text-xs font-medium">
          <span>Reason</span>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Corrected missed clock-out, approved extra time..."
          />
        </label>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || updateEntryMutation.isPending}
            onClick={() => {
              if (!entry?.id) {
                return
              }

              updateEntryMutation.mutate(
                {
                  clockedInAt: fromDateTimeLocal(clockedInAt),
                  clockedOutAt: clockedOutAt
                    ? fromDateTimeLocal(clockedOutAt)
                    : null,
                  entryId: entry.id,
                  payableEndAt: payableEndAt
                    ? fromDateTimeLocal(payableEndAt)
                    : null,
                  payableStartAt: fromDateTimeLocal(payableStartAt),
                  reason,
                  status,
                },
                {
                  onSuccess: () => onOpenChange(false),
                },
              )
            }}
          >
            Save edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TimeField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="space-y-1 text-xs font-medium">
      <span>{label}</span>
      <Input
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return ""
  }

  const date = new Date(value)
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

function fromDateTimeLocal(value: string) {
  return new Date(value).toISOString()
}

export { EditTimesheetEntryDialog }
