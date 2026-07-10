"use client"

import * as React from "react"
import { ClockIcon, HelpCircleIcon, MapPinIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { HoldToConfirmButton } from "@/features/time-clock/components/hold-to-confirm-button"
import { useLiveNow } from "@/features/time-clock/hooks/use-live-now"
import { useEmployeeClockMutation } from "@/features/time-clock/hooks/use-time-clock-mutations"
import { useEmployeeClockQuery } from "@/features/time-clock/hooks/use-time-clock-query"
import type {
  ClockReason,
  ClockShiftSegment,
  EarlyClockInMode,
  EmployeeClockPageData,
} from "@/features/time-clock/types"
import {
  formatElapsedTime,
  getElapsedMilliseconds,
} from "@/features/time-clock/utils/elapsed-time"
import Title from "@/components/title"
import { BrandMark } from "@/components/app/brand"

const reasonOptions: Array<{ label: string; value: ClockReason }> = [
  { label: "Asked to come in early", value: "asked_early" },
  { label: "Asked to come in late", value: "asked_late" },
  { label: "Covering a shift", value: "covering_shift" },
  { label: "Transport delay", value: "transport_delay" },
  { label: "Manager approved", value: "manager_approved" },
  { label: "Other", value: "other" },
]

function EmployeeClockPage({
  initialData,
  scanSessionId,
  userId,
}: {
  initialData: EmployeeClockPageData
  scanSessionId: string
  userId: string
}) {
  const queryInput = { scanSessionId, userId }
  const query = useEmployeeClockQuery(queryInput)
  const data = query.data ?? initialData
  const mutation = useEmployeeClockMutation(queryInput)
  const liveNow = useLiveNow(Boolean(data.openEntry))
  const [earlyClockInMode, setEarlyClockInMode] =
    React.useState<EarlyClockInMode>(
      data.reviewPrompt.defaultMode ?? "scheduled"
    )
  const [reason, setReason] = React.useState<ClockReason | "">("")
  const [showReasonError, setShowReasonError] = React.useState(false)

  React.useEffect(() => {
    if (mutation.isSuccess) {
      const timeout = window.setTimeout(() => {
        window.location.assign("/dashboard")
      }, 2500)

      return () => window.clearTimeout(timeout)
    }
  }, [mutation.isSuccess])

  const requiresReason =
    data.nextAction === "clock_in" &&
    (data.reviewPrompt.isReasonRequired ||
      data.reviewPrompt.kind === "unmatched" ||
      data.reviewPrompt.kind === "late" ||
      (data.reviewPrompt.kind === "early" && earlyClockInMode === "now"))
  const canSubmit = data.isClockingEnabled && !mutation.isPending
  const isSplitClockIn =
    data.nextAction === "clock_in" && data.matchedShift?.shiftType === "split"
  const splitSegmentStates =
    isSplitClockIn && data.matchedShift
      ? getSplitSegmentStates({
          completedSegments: data.completedShiftSegments,
          segments: data.matchedShift.segments,
        })
      : []

  function submitClock(shiftSegment?: ClockShiftSegment) {
    if (requiresReason && !reason) {
      setShowReasonError(true)
      return
    }

    mutation.mutate({
      action: data.nextAction,
      earlyClockInMode:
        data.nextAction === "clock_in" ? earlyClockInMode : undefined,
      reason: reason || undefined,
      shiftSegment,
    })
  }

  if (mutation.isSuccess) {
    return (
      <ClockShell>
        <Card className="border-border/70 bg-background shadow-sm">
          <CardContent className="space-y-3 p-5 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClockIcon className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {data.nextAction === "clock_in" ? "Clocked in" : "Clocked out"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Returning you to the dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </ClockShell>
    )
  }

  return (
    <ClockShell>
      {data.setupMessage ? (
        <Alert className="border-border/70 bg-background">
          <AlertTitle>{data.setupMessage}</AlertTitle>
          <AlertDescription>
            Ask a manager for help if you need to start work now.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-border/70 bg-background shadow-sm">
        <CardContent className="space-y-5 p-5">
          <section>
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Team member
            </p>
            <p className="mt-1 text-xl font-semibold">{data.employee.name}</p>
          </section>

          <section className="rounded-lg border border-border/70 bg-muted/20 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Current status
            </p>
            <p className="mt-1 text-lg font-semibold">
              {data.openEntry ? "Clocked in" : "Not clocked in"}
            </p>
            {data.openEntry ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Since {formatDateTime(data.openEntry.clockedInAt)}
                </p>
                <span className="rounded-md bg-background px-2 py-1 font-mono text-sm font-semibold">
                  {formatElapsedTime(
                    getElapsedMilliseconds(data.openEntry.clockedInAt, liveNow)
                  )}
                </span>
              </div>
            ) : null}
          </section>

          <section className="rounded-lg border border-border/70 p-4">
            <div className="flex items-start gap-3">
              <MapPinIcon className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="text-sm font-semibold">
                  {data.matchedShift ? "Matched shift" : "No matched shift"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.matchedShift
                    ? `${data.matchedShift.dateLabel}, ${data.matchedShift.timeLabel} - ${data.matchedShift.zoneName}`
                    : "This is allowed, but a manager will review it."}
                </p>
              </div>
            </div>
          </section>

          {data.reviewPrompt.message ? (
            <Alert className="border-border/70 bg-muted/20">
              <AlertTitle>Review needed</AlertTitle>
              <AlertDescription>{data.reviewPrompt.message}</AlertDescription>
            </Alert>
          ) : null}

          {data.reviewPrompt.kind === "early" ? (
            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-muted-foreground uppercase">
                Paid start
              </legend>
              <EarlyStartOption
                checked={earlyClockInMode === "scheduled"}
                label="Start paid time at scheduled start"
                onChange={() => setEarlyClockInMode("scheduled")}
              />
              <EarlyStartOption
                checked={earlyClockInMode === "now"}
                label="Start paid time now"
                onChange={() => setEarlyClockInMode("now")}
              />
            </fieldset>
          ) : null}

          {requiresReason ? (
            <label className="space-y-1 text-xs font-medium">
              <span>Reason</span>
              <select
                className="mb-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={reason}
                onChange={(event) => {
                  setShowReasonError(false)
                  setReason(event.target.value as ClockReason | "")
                }}
              >
                <option value="">Choose a reason</option>
                {reasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {showReasonError ? (
                <span className="block text-xs text-destructive">
                  Choose a reason to continue.
                </span>
              ) : null}
            </label>
          ) : null}

          {isSplitClockIn && data.matchedShift ? (
            <div className="grid gap-2">
              {splitSegmentStates.map(({ disabled, label, segment }) => (
                <HoldToConfirmButton
                  key={segment.key}
                  className="h-auto min-h-14 w-full py-3 text-base"
                  disabled={!canSubmit || disabled}
                  isPending={mutation.isPending}
                  label={getHoldLabel(label, disabled)}
                  subLabel={segment.timeLabel}
                  onConfirm={() => submitClock(segment.key)}
                />
              ))}
            </div>
          ) : (
            <HoldToConfirmButton
              className="h-12 w-full text-base"
              disabled={!canSubmit}
              isPending={mutation.isPending}
              label={`Hold to ${
                data.nextAction === "clock_in" ? "clock in" : "clock out"
              }`}
              onConfirm={() => submitClock(data.matchedShift?.segments[0]?.key)}
            />
          )}

          <a
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            href="/help"
          >
            <HelpCircleIcon className="size-4" />
            Need help clocking in?
          </a>
        </CardContent>
      </Card>
    </ClockShell>
  )
}

function ClockShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/20 px-4 py-5 text-foreground">
      <main className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-md flex-col gap-4">
        <header className="flex items-center justify-center gap-3">
          <BrandMark />
          <Title />
        </header>
        {children}
      </main>
    </div>
  )
}

function EarlyStartOption({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: () => void
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border/70 px-3 py-2 text-sm">
      <input
        checked={checked}
        className="size-4"
        name="early-start-mode"
        type="radio"
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  )
}

function getSplitSegmentStates({
  completedSegments,
  segments,
}: {
  completedSegments: ClockShiftSegment[]
  segments: NonNullable<EmployeeClockPageData["matchedShift"]>["segments"]
}) {
  const firstComplete = completedSegments.includes("split_first")
  const secondComplete = completedSegments.includes("split_second")

  return segments.map((segment) => {
    if (segment.key === "split_first") {
      return {
        disabled: firstComplete || secondComplete,
        label: firstComplete ? "First half complete" : "Clock in - First half",
        segment,
      }
    }

    if (segment.key === "split_second") {
      const isLocked = !firstComplete

      return {
        disabled: isLocked || secondComplete,
        label: secondComplete
          ? "Second half complete"
          : isLocked
            ? "Second half"
            : "Clock in - Second half",
        segment,
      }
    }

    return {
      disabled: completedSegments.includes(segment.key),
      label: `Clock in - ${segment.label}`,
      segment,
    }
  })
}

function getHoldLabel(label: string, disabled: boolean) {
  if (disabled) {
    return label
  }

  return label.replace(/^Clock in/, "Hold to clock in")
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value))
}

export { EmployeeClockPage }
