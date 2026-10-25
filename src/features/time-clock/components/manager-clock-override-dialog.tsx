"use client"

import { ManualClockActionButton } from "./manual-clock-action-button"
import type {
  ClockAction,
  ManagerClockEmployee,
} from "@/features/time-clock/types"
import { useLocationFeatureFlags } from "@/features/feature-flags/hooks/use-location-feature-flags"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { getManagerClockEmployeeKey } from "@/features/time-clock/utils/manager-clock-employees"
import { toLocalClockInput } from "@/features/time-clock/utils/manual-clock-time"
import { useManualClockOverrideForm } from "@/features/time-clock/hooks/use-manual-clock-override-form"
import { cn } from "@/lib/utils"

type OverrideSubmission = {
  action: ClockAction
  employee: ManagerClockEmployee
  reason: string
  occurredAt: string
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
  const form = useManualClockOverrideForm({
    employees,
    initialAction,
    initialEmployeeKey,
    open,
  })
  const { action, employee, employeeKey, reason, isValid } = form
  const flags = useLocationFeatureFlags(employee?.locationId ?? "")
  const clockInBlocked =
    action === "clock_in" && !flags["time_clock.clock_in"].enabled

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="top-auto bottom-0 left-0 flex max-h-[calc(100dvh-1rem)] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[22px] rounded-b-none p-0 text-[#10204b] sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-h-[calc(100dvh-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        <DialogHeader className="shrink-0 border-b border-[#edf0f6] px-5 py-5 pr-12">
          <DialogTitle className="text-lg font-bold tracking-[-0.02em]">
            Manual {action === "clock_in" ? "clock in" : "clock out"}
          </DialogTitle>
          <DialogDescription>
            Record who you are helping and why the manual change is needed.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <fieldset>
            <legend className="text-xs font-semibold text-[#617096]">
              Action
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ManualClockActionButton
                action="clock_in"
                currentAction={action}
                onClick={() => form.setAction("clock_in")}
              />
              <ManualClockActionButton
                action="clock_out"
                currentAction={action}
                onClick={() => form.setAction("clock_out")}
              />
            </div>
          </fieldset>

          <label className="block text-xs font-semibold text-[#617096]">
            Team member
            <select
              className="mt-2 h-11 w-full rounded-xl border border-[#dfe4ef] bg-white px-3 text-sm font-semibold text-[#10204b] transition outline-none focus:border-[#236cff] focus:ring-2 focus:ring-blue-100"
              onChange={(event) => form.setEmployeeKey(event.target.value)}
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
            Clock {action === "clock_in" ? "in" : "out"} date and time
            <Input
              type="datetime-local"
              className="mt-2 h-11 bg-white text-sm"
              value={form.time}
              max={toLocalClockInput()}
              min={
                action === "clock_out" && employee?.openEntry
                  ? toLocalClockInput(new Date(employee.openEntry.clockedInAt))
                  : undefined
              }
              onChange={(event) => form.setTime(event.target.value)}
              aria-invalid={Boolean(form.timeError)}
              aria-describedby="manual-clock-time-help"
              required
            />
          </label>
          <p id="manual-clock-time-help" className="text-xs text-[#617096]">
            {form.timeError ??
              `Times use your device timezone (${Intl.DateTimeFormat().resolvedOptions().timeZone}). Choose an earlier time for a missed clock-in or clock-out.`}
          </p>

          <label className="block text-xs font-semibold text-[#617096]">
            Reason
            <Textarea
              className="mt-2 min-h-24 rounded-xl border-[#dfe4ef] bg-white text-sm text-[#10204b] shadow-none placeholder:text-[#9aa4ba] focus-visible:border-[#236cff] focus-visible:ring-blue-100"
              maxLength={300}
              onChange={(event) => form.setReason(event.target.value)}
              placeholder="For example, station would not scan their tag."
              value={reason}
            />
          </label>

          {clockInBlocked && (
            <p role="status" className="text-sm text-amber-800">
              New clock-ins are unavailable at this location. Clock-out remains
              available.
            </p>
          )}
          <Button
            className={cn(
              "h-11 w-full rounded-xl text-sm font-semibold",
              action === "clock_in"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            )}
            disabled={!isValid || isPending || clockInBlocked}
            onClick={() => {
              if (employee && form.occurredAt && isValid && !clockInBlocked)
                onSubmit({
                  action,
                  employee,
                  reason,
                  occurredAt: form.occurredAt,
                })
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

export { ManagerClockOverrideDialog }
