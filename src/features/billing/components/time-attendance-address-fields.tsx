"use client"

import { PackageCheckIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TimeAttendanceDeliveryAddress } from "@/features/billing/schemas/time-attendance-addon-schemas"

type TimeAttendanceAddressValue = {
  name: string
  line1: string
  line2: string
  city: string
  county: string
  postcode: string
}

type TimeAttendanceAddressField = keyof TimeAttendanceAddressValue

const emptyTimeAttendanceAddress: TimeAttendanceAddressValue = {
  city: "",
  county: "",
  line1: "",
  line2: "",
  name: "",
  postcode: "",
}

function TimeAttendanceAddressFields({
  idPrefix,
  onChange,
  onPostcodeChange,
  postcodeMessage,
  value,
}: {
  idPrefix: string
  onChange: (value: TimeAttendanceAddressValue) => void
  onPostcodeChange?: () => void
  postcodeMessage?: string
  value: TimeAttendanceAddressValue
}) {
  function updateField(field: TimeAttendanceAddressField, nextValue: string) {
    onChange({
      ...value,
      [field]: nextValue,
    })

    if (field === "postcode") {
      onPostcodeChange?.()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 p-4">
        <PackageCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-xs leading-5 text-muted-foreground">
          Clock-in station delivery is currently limited by region. Enter the
          delivery postcode and we will confirm availability before activation.
        </p>
      </div>
      <AddressField
        idPrefix={idPrefix}
        name="name"
        label="Recipient name"
        autoComplete="name"
        value={value.name}
        onChange={updateField}
      />
      <AddressField
        idPrefix={idPrefix}
        name="line1"
        label="Address line 1"
        autoComplete="address-line1"
        value={value.line1}
        onChange={updateField}
      />
      <AddressField
        idPrefix={idPrefix}
        name="line2"
        label="Address line 2"
        autoComplete="address-line2"
        required={false}
        value={value.line2}
        onChange={updateField}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AddressField
          idPrefix={idPrefix}
          name="city"
          label="Town or city"
          autoComplete="address-level2"
          value={value.city}
          onChange={updateField}
        />
        <AddressField
          idPrefix={idPrefix}
          name="county"
          label="County"
          autoComplete="address-level1"
          required={false}
          value={value.county}
          onChange={updateField}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AddressField
          idPrefix={idPrefix}
          name="postcode"
          label="Postcode"
          autoComplete="postal-code"
          error={postcodeMessage}
          value={value.postcode}
          onChange={updateField}
        />
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-country`}>Country</Label>
          <Input id={`${idPrefix}-country`} value="United Kingdom" disabled />
        </div>
      </div>
    </div>
  )
}

function AddressField({
  autoComplete,
  error,
  idPrefix,
  label,
  name,
  onChange,
  required = true,
  value,
}: {
  autoComplete: string
  error?: string
  idPrefix: string
  label: string
  name: TimeAttendanceAddressField
  onChange: (field: TimeAttendanceAddressField, value: string) => void
  required?: boolean
  value: string
}) {
  const inputId = `${idPrefix}-${name}`
  const errorId = `${inputId}-error`

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        name={name}
        autoComplete={autoComplete}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        required={required}
        maxLength={120}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
      />
      {error ? (
        <p id={errorId} className="text-xs leading-5 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function toTimeAttendanceDeliveryAddress(
  value: TimeAttendanceAddressValue
): TimeAttendanceDeliveryAddress {
  return {
    city: value.city.trim(),
    country: "GB",
    county: value.county.trim() || undefined,
    line1: value.line1.trim(),
    line2: value.line2.trim() || undefined,
    name: value.name.trim(),
    postcode: value.postcode.trim(),
  }
}

export {
  TimeAttendanceAddressFields,
  emptyTimeAttendanceAddress,
  toTimeAttendanceDeliveryAddress,
}
export type { TimeAttendanceAddressValue }
