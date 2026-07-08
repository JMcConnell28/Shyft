"use client"

import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { CalendarX2Icon, FlaskConicalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  TimeAttendanceAddonDialog,
  type TimeAttendanceDeliveryAddress,
} from "@/features/billing/components/time-attendance-addon-dialog"
import { updateTimeAttendanceAddon } from "@/features/billing/server-fns"
import type { LocationAddon } from "@/features/billing/types"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

type AddonAction = "activate" | "cancel" | "keep"

function TimeAttendanceAddonButton({
  enabled,
  status,
  cancelAt,
  hardwareEntitlementAvailable,
  locationId,
}: {
  enabled: boolean
  status: LocationAddon["status"] | null
  cancelAt: string | null
  hardwareEntitlementAvailable: boolean
  locationId: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isTestMode, setIsTestMode] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const updateAddon = useServerFn(updateTimeAttendanceAddon)
  const router = useRouter()

  async function update(
    action: AddonAction,
    address?: TimeAttendanceDeliveryAddress
  ) {
    setIsPending(true)
    try {
      await updateAddon({
        data: {
          action,
          confirmationAccepted: action === "activate" ? true : undefined,
          deliveryAddress: address,
          locationId,
        },
      })
      closeDialog()
      await router.invalidate()
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "We could not update Time & Attendance.",
      })
    } finally {
      setIsPending(false)
    }
  }

  function handleActivation(address: TimeAttendanceDeliveryAddress) {
    if (isTestMode) {
      closeDialog()
      showSuccessToast("Test activation completed. No billing was changed.")
      return
    }

    void update("activate", hardwareEntitlementAvailable ? address : undefined)
  }

  function openDialog(testMode = false) {
    setIsTestMode(testMode)
    setIsOpen(true)
  }

  function closeDialog() {
    setIsOpen(false)
    setIsTestMode(false)
  }

  const isCanceling = status === "canceling"

  return (
    <>
      <AddonControls
        cancelAt={cancelAt}
        enabled={enabled}
        isCanceling={isCanceling}
        isPending={isPending}
        onAdd={() => openDialog()}
        onCancel={() => void update("cancel")}
        onKeep={() => void update("keep")}
        onTest={() => openDialog(true)}
      />
      <TimeAttendanceAddonDialog
        hardwareEntitlementAvailable={hardwareEntitlementAvailable}
        isOpen={isOpen}
        isPending={isPending}
        isTestMode={isTestMode}
        locationId={locationId}
        onClose={closeDialog}
        onSubmit={handleActivation}
      />
    </>
  )
}

function AddonControls({
  cancelAt,
  enabled,
  isCanceling,
  isPending,
  onAdd,
  onCancel,
  onKeep,
  onTest,
}: {
  cancelAt: string | null
  enabled: boolean
  isCanceling: boolean
  isPending: boolean
  onAdd: () => void
  onCancel: () => void
  onKeep: () => void
  onTest: () => void
}) {
  if (isCanceling) {
    return (
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <p className="flex items-center gap-1.5 text-xs text-amber-700">
          <CalendarX2Icon className="size-3.5" />
          Cancels {cancelAt ? `on ${formatDate(cancelAt)}` : "at renewal"}
        </p>
        <div className="flex flex-wrap gap-2">
          <TestAddFlowButton onClick={onTest} />
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onKeep}
          >
            {isPending ? "Updating..." : "Keep Time & Attendance"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {enabled ? <TestAddFlowButton onClick={onTest} /> : null}
      <Button
        type="button"
        variant={enabled ? "outline" : "default"}
        disabled={isPending}
        onClick={enabled ? onCancel : onAdd}
      >
        {isPending
          ? "Updating..."
          : enabled
            ? "Cancel at renewal"
            : "Add Time & Attendance"}
      </Button>
    </div>
  )
}

function TestAddFlowButton({ onClick }: { onClick: () => void }) {
  if (!import.meta.env.DEV) return null

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick}>
      <FlaskConicalIcon className="size-3.5" />
      Test add flow
    </Button>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value))
}

export { TimeAttendanceAddonButton }
