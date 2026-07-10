"use client"

import * as React from "react"
import { Clock3Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  TimeAttendanceAddressFields,
  emptyTimeAttendanceAddress,
  toTimeAttendanceDeliveryAddress,
} from "@/features/billing/components/time-attendance-address-fields"
import {
  timeAttendanceDeliveryAddressSchema,
  type TimeAttendanceDeliveryAddress,
} from "@/features/billing/schemas/time-attendance-addon-schemas"

function TimeAttendanceAddonDialog({
  hardwareEntitlementAvailable,
  isOpen,
  isPending,
  isTestMode,
  locationId,
  onClose,
  onSubmit,
}: {
  hardwareEntitlementAvailable: boolean
  isOpen: boolean
  isPending: boolean
  isTestMode: boolean
  locationId: string
  onClose: () => void
  onSubmit: (address: TimeAttendanceDeliveryAddress) => void
}) {
  const [confirmed, setConfirmed] = React.useState(false)
  const [deliveryAddress, setDeliveryAddress] = React.useState(
    emptyTimeAttendanceAddress
  )
  const [postcodeMessage, setPostcodeMessage] = React.useState("")
  const showHardwareForm = hardwareEntitlementAvailable || isTestMode

  React.useEffect(() => {
    if (!isOpen) {
      setConfirmed(false)
      setDeliveryAddress(emptyTimeAttendanceAddress)
      setPostcodeMessage("")
    }
  }, [isOpen])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const address = toTimeAttendanceDeliveryAddress(deliveryAddress)
    const parsedDeliveryAddress =
      timeAttendanceDeliveryAddressSchema.safeParse(address)
    const postcodeIssue = parsedDeliveryAddress.success
      ? undefined
      : parsedDeliveryAddress.error.issues.find(
          (issue) => issue.path[0] === "postcode"
        )

    if (showHardwareForm && postcodeIssue) {
      setPostcodeMessage(postcodeIssue.message)
      return
    }

    onSubmit(address)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto p-0 sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock3Icon className="size-5" />
            </div>
            <DialogTitle className="text-lg">
              {isTestMode
                ? "Test Time & Attendance setup"
                : "Add Time & Attendance"}
            </DialogTitle>
            <DialogDescription>
              {getDescription({ hardwareEntitlementAvailable, isTestMode })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 p-5 sm:p-6">
            {showHardwareForm ? (
              <TimeAttendanceAddressFields
                idPrefix={`delivery-${locationId}`}
                value={deliveryAddress}
                postcodeMessage={postcodeMessage}
                onChange={setDeliveryAddress}
                onPostcodeChange={() => setPostcodeMessage("")}
              />
            ) : null}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 p-4">
              <Checkbox
                className="mt-0.5"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
              />
              <span className="text-xs leading-5 text-muted-foreground">
                {isTestMode
                  ? "I confirm this is a test submission and understand that no billing or hardware records will change."
                  : "I confirm that Time & Attendance will add £1 per month, plus VAT where applicable, for each used employee in enabled locations. Usage is billed in arrears for each billing period."}
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
            >
              Not now
            </Button>
            <Button type="submit" disabled={isPending || !confirmed}>
              {isPending
                ? "Activating..."
                : isTestMode
                  ? "Complete test"
                  : "Confirm and activate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getDescription(input: {
  hardwareEntitlementAvailable: boolean
  isTestMode: boolean
}) {
  if (input.isTestMode) {
    return "This repeats the complete setup form without changing billing, Stripe, or hardware records."
  }
  return input.hardwareEntitlementAvailable
    ? "Time & Attendance adds £1 per used employee in enabled locations, plus VAT where applicable. Your first activation includes one standard NFC clock-in stand where delivery is available."
    : "Time & Attendance adds £1 per used employee in enabled locations, plus VAT where applicable. This location has already used its included hardware entitlement, so another stand is not included."
}

export { TimeAttendanceAddonDialog }
export type { TimeAttendanceDeliveryAddress }
