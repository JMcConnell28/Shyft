"use client"

import * as React from "react"

import type { EmployeeCompensationInput } from "@/features/staff-groups/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  DEFAULT_MINIMUM_WAGE_PENCE,
  poundsToPence,
} from "@/features/staff-groups/utils/compensation"

type EmployeeCompensationDialogProps = {
  initialCompensation?: EmployeeCompensationInput
  label: string
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSave: (compensation: EmployeeCompensationInput) => Promise<void>
}

function EmployeeCompensationDialog({
  initialCompensation,
  label,
  open,
  pending,
  onOpenChange,
  onSave,
}: EmployeeCompensationDialogProps) {
  const [payType, setPayType] = React.useState<"hourly" | "salary">(
    initialCompensation?.type ?? "hourly"
  )
  const [amount, setAmount] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setPayType(initialCompensation?.type ?? "hourly")
    setAmount(
      initialCompensation?.type === "salary"
        ? (initialCompensation.weeklySalaryPence / 100).toFixed(2)
        : (
            (initialCompensation?.hourlyRatePence ??
              DEFAULT_MINIMUM_WAGE_PENCE) / 100
          ).toFixed(2)
    )
    setError(null)
  }, [initialCompensation, open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amountPence = poundsToPence(amount)

    if (amountPence === null) {
      setError("Enter a valid amount of zero or more.")
      return
    }

    const compensation: EmployeeCompensationInput =
      payType === "hourly"
        ? { type: "hourly", hourlyRatePence: amountPence }
        : { type: "salary", weeklySalaryPence: amountPence }

    await onSave(compensation)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-md">
        <form onSubmit={(event) => void handleSubmit(event)}>
          <DialogHeader className="p-5 pb-4">
            <DialogTitle>Set pay rate</DialogTitle>
            <DialogDescription>{label}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 px-5 pb-5">
            <div className="grid gap-2">
              <Label htmlFor="pay-type">Pay type</Label>
              <NativeSelect
                id="pay-type"
                className="w-full"
                value={payType}
                disabled={pending}
                onChange={(event) => {
                  setPayType(event.target.value as "hourly" | "salary")
                  setAmount("")
                  setError(null)
                }}
              >
                <NativeSelectOption value="hourly">Hourly</NativeSelectOption>
                <NativeSelectOption value="salary">Salary</NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pay-amount">
                {payType === "hourly" ? "Hourly rate" : "Weekly salary cost"}
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                  £
                </span>
                <Input
                  id="pay-amount"
                  className="pl-6"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  disabled={pending}
                  onChange={(event) => {
                    setAmount(event.target.value)
                    setError(null)
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {payType === "hourly"
                  ? "Applied to every scheduled hour."
                  : "Counted once when this employee is scheduled in the week."}
              </p>
              {error ? (
                <p className="text-xs text-destructive">{error}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save rate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { EmployeeCompensationDialog }
