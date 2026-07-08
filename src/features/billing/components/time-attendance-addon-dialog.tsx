"use client"

import * as React from "react"
import { Clock3Icon, PackageCheckIcon } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const [postcodeMessage, setPostcodeMessage] = React.useState("")
  const showHardwareForm = hardwareEntitlementAvailable || isTestMode

  React.useEffect(() => {
    if (!isOpen) {
      setConfirmed(false)
      setPostcodeMessage("")
    }
  }, [isOpen])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const deliveryAddress = getDeliveryAddress(
      new FormData(event.currentTarget)
    )
    const parsedDeliveryAddress =
      timeAttendanceDeliveryAddressSchema.safeParse(deliveryAddress)
    const postcodeIssue = parsedDeliveryAddress.success
      ? undefined
      : parsedDeliveryAddress.error.issues.find(
          (issue) => issue.path[0] === "postcode"
        )

    if (showHardwareForm && postcodeIssue) {
      setPostcodeMessage(postcodeIssue.message)
      return
    }

    onSubmit(deliveryAddress)
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
              <DeliveryAddressFields
                locationId={locationId}
                postcodeMessage={postcodeMessage}
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
                  : "I confirm that Time & Attendance will add £1 per month, plus VAT where applicable, for each active employee assigned to enabled locations. Paid activations are invoiced immediately on a prorated basis; trial activations begin billing when the core trial ends."}
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

function DeliveryAddressFields({
  locationId,
  onPostcodeChange,
  postcodeMessage,
}: {
  locationId: string
  onPostcodeChange: () => void
  postcodeMessage: string
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
        <PackageCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-xs leading-5 text-muted-foreground">
          Clock-in stations are coming soon outside Derry. For now, delivery is
          available for BT47 and BT48 postcodes only.
        </p>
      </div>
      <AddressField name="name" label="Recipient name" autoComplete="name" />
      <AddressField
        name="line1"
        label="Address line 1"
        autoComplete="address-line1"
      />
      <AddressField
        name="line2"
        label="Address line 2"
        autoComplete="address-line2"
        required={false}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AddressField
          name="city"
          label="Town or city"
          autoComplete="address-level2"
        />
        <AddressField
          name="county"
          label="County"
          autoComplete="address-level1"
          required={false}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AddressField
          name="postcode"
          label="Postcode"
          autoComplete="postal-code"
          error={postcodeMessage}
          onChange={onPostcodeChange}
        />
        <div className="space-y-2">
          <Label htmlFor={`${locationId}-country`}>Country</Label>
          <Input id={`${locationId}-country`} value="United Kingdom" disabled />
        </div>
      </div>
    </div>
  )
}

function AddressField({
  autoComplete,
  error,
  label,
  name,
  onChange,
  required = true,
}: {
  autoComplete: string
  error?: string
  label: string
  name: string
  onChange?: () => void
  required?: boolean
}) {
  const errorId = `delivery-${name}-error`

  return (
    <div className="space-y-2">
      <Label htmlFor={`delivery-${name}`}>{label}</Label>
      <Input
        id={`delivery-${name}`}
        name={name}
        autoComplete={autoComplete}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        required={required}
        maxLength={120}
        onChange={onChange}
      />
      {error ? (
        <p id={errorId} className="text-xs leading-5 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function getDeliveryAddress(formData: FormData): TimeAttendanceDeliveryAddress {
  const value = (name: string) => {
    const field = formData.get(name)
    return typeof field === "string" ? field.trim() : ""
  }

  return {
    name: value("name"),
    line1: value("line1"),
    line2: value("line2") || undefined,
    city: value("city"),
    county: value("county") || undefined,
    postcode: value("postcode"),
    country: "GB",
  }
}

function getDescription(input: {
  hardwareEntitlementAvailable: boolean
  isTestMode: boolean
}) {
  if (input.isTestMode) {
    return "This repeats the complete setup form without changing billing, Stripe, or hardware records."
  }
  return input.hardwareEntitlementAvailable
    ? "Time & Attendance adds £1 per active employee assigned to enabled locations, plus VAT where applicable. Your first activation includes one standard NFC clock-in stand with BT47 or BT48 delivery."
    : "Time & Attendance adds £1 per active employee assigned to enabled locations, plus VAT where applicable. This location has already used its included hardware entitlement, so another stand is not included."
}

export { TimeAttendanceAddonDialog }
export type { TimeAttendanceDeliveryAddress }
