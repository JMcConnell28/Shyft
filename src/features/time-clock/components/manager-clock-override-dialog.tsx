"use client"

import * as React from "react"
import { LogInIcon, LogOutIcon } from "lucide-react"

import type {
  ClockAction,
  ManagerClockEmployee,
} from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  getManagerClockEmployeeKey,
  getSuggestedManagerClockEmployeeKey,
} from "@/features/time-clock/utils/manager-clock-employees"
import { cn } from "@/lib/utils"

type OverrideSubmission = {
  action: ClockAction
  employee: ManagerClockEmployee
  reason: string
}

type ManagerClockOverrideDialogProps = {
  employees: Array<ManagerClockEmployee>
  initialAction: ClockAction
  initialEmployeeKey: string
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (submission: OverrideSubmission) => void
  open: boolean
}

function ManagerClockOverrideDialog({
  employees,
  initialAction,
  initialEmployeeKey,
  isPending,
  onOpenChange,
  onSubmit,
  open,
}: ManagerClockOverrideDialogProps) {
  const [action, setAction] = React.useState<ClockAction>(initialAction)
  const [employeeKey, setEmployeeKey] = React.useState(initialEmployeeKey)
  const [reason, setReason] = React.useState("")
  const suggestedEmployeeKey = getSuggestedManagerClockEmployeeKey(
    employees,
    initialAction
  )

  React.useEffect(() => {
    if (!open) return

    setAction(initialAction)
    setEmployeeKey(initialEmployeeKey || suggestedEmployeeKey)
    setReason("")
  }, [initialAction, initialEmployeeKey, open, suggestedEmployeeKey])

  const employee =
    employees.find(
      (item) => getManagerClockEmployeeKey(item) === employeeKey
    ) ?? null
  const isValid = employee !== null && reason.trim().length >= 5

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="bottom-0 top-auto left-0 w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-t-[22px] rounded-b-none p-0 text-[#10204b] sm:top-1/2 sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        <DialogHeader className="border-b border-[#edf0f6] px-5 py-5 pr-12">
          <DialogTitle className="text-lg font-bold tracking-[-0.02em]">
            Manual {action === "clock_in" ? "clock in" : "clock out"}
          </DialogTitle>
          <DialogDescription>
            Record who you are helping and why the manual change is needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-5">
          <fieldset>
            <legend className="text-xs font-semibold text-[#617096]">
              Action
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ActionButton
                action="clock_in"
                currentAction={action}
                onClick={() => {
                  setAction("clock_in")
                  setEmployeeKey(
                    getSuggestedManagerClockEmployeeKey(employees, "clock_in")
                  )
                }}
              />
              <ActionButton
                action="clock_out"
                currentAction={action}
                onClick={() => {
                  setAction("clock_out")
                  setEmployeeKey(
                    getSuggestedManagerClockEmployeeKey(employees, "clock_out")
                  )
                }}
              />
            </div>
          </fieldset>

          <label className="block text-xs font-semibold text-[#617096]">
            Team member
            <select
              className="mt-2 h-11 w-full rounded-xl border border-[#dfe4ef] bg-white px-3 text-sm font-semibold text-[#10204b] outline-none transition focus:border-[#236cff] focus:ring-2 focus:ring-blue-100"
              onChange={(event) => setEmployeeKey(event.target.value)}
              value={employeeKey}
            >
              <option value="">Select a team member</option>
              {employees.map((item) => (
                <option
                  key={getManagerClockEmployeeKey(item)}
                  value={getManagerClockEmployeeKey(item)}
                >
                  {item.name} — {item.locationName}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-[#617096]">
            Reason
            <Textarea
              className="mt-2 min-h-24 rounded-xl border-[#dfe4ef] bg-white text-sm text-[#10204b] shadow-none placeholder:text-[#9aa4ba] focus-visible:border-[#236cff] focus-visible:ring-blue-100"
              maxLength={300}
              onChange={(event) => setReason(event.target.value)}
              placeholder="For example, station would not scan their tag."
              value={reason}
            />
          </label>

          <Button
            className={cn(
              "h-11 w-full rounded-xl text-sm font-semibold",
              action === "clock_in"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            )}
            disabled={!isValid || isPending}
            onClick={() => {
              if (employee) onSubmit({ action, employee, reason })
            }}
          >
            {isPending
              ? "Applying…"
              : `${action === "clock_in" ? "Clock in" : "Clock out"}${
                  employee ? ` ${employee.name}` : ""
                }`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ActionButton({
  action,
  currentAction,
  onClick,
}: {
  action: ClockAction
  currentAction: ClockAction
  onClick: () => void
}) {
  const isSelected = action === currentAction
  const Icon = action === "clock_in" ? LogInIcon : LogOutIcon

  return (
    <Button
      aria-pressed={isSelected}
      className={cn(
        "h-11 rounded-xl border-[#dfe4ef] bg-white text-sm font-semibold shadow-none",
        isSelected &&
          (action === "clock_in"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-rose-700")
      )}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      <Icon className="size-4" />
      Clock {action === "clock_in" ? "in" : "out"}
    </Button>
  )
}

export { ManagerClockOverrideDialog }
