"use client"

import { PackageCheckIcon } from "lucide-react"

import type { TimeAttendanceDeliveryAddress } from "@/features/billing/schemas/time-attendance-addon-schemas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  mode = "delivery",
  value,
}: {
  idPrefix: string
  onChange: (value: TimeAttendanceAddressValue) => void
  onPostcodeChange?: () => void
  postcodeMessage?: string
  mode?: "delivery" | "location"
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
    <div
      className={
        mode === "location" ? "grid grid-cols-2 gap-x-3 gap-y-2" : "space-y-4"
      }
    >
      {mode === "delivery" ? (
        <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 p-4">
          <PackageCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-xs leading-5 text-muted-foreground">
            Clock-in station delivery is currently limited by region. Enter the
            delivery postcode and we will confirm availability before
            activation.
          </p>
        </div>
      ) : null}
      <AddressField
        idPrefix={idPrefix}
        name="name"
        label={mode === "location" ? "Delivery contact" : "Recipient name"}
        autoComplete="name"
        value={value.name}
        onChange={updateField}
        className={mode === "location" ? "col-span-2 sm:col-span-1" : undefined}
      />
      {mode === "location" ? (
        <AddressField
          idPrefix={idPrefix}
          name="postcode"
          label="Postcode"
          autoComplete="postal-code"
          error={postcodeMessage}
          value={value.postcode}
          onChange={updateField}
          className="col-span-2 sm:col-span-1"
        />
      ) : null}
      <AddressField
        idPrefix={idPrefix}
        name="line1"
        label="Address line 1"
        autoComplete="address-line1"
        value={value.line1}
        onChange={updateField}
        className={mode === "location" ? "col-span-2 sm:col-span-1" : undefined}
      />
      <AddressField
        idPrefix={idPrefix}
        name="line2"
        label="Address line 2"
        autoComplete="address-line2"
        required={false}
        value={value.line2}
        onChange={updateField}
        className={mode === "location" ? "col-span-2 sm:col-span-1" : undefined}
      />
      <div
        className={
          mode === "location"
            ? "col-span-2 grid grid-cols-2 gap-3"
            : "grid gap-4 sm:grid-cols-2"
        }
      >
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
      {mode === "delivery" ? (
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
      ) : null}
    </div>
  )
}

function AddressField({
  autoComplete,
  className,
  error,
  idPrefix,
  label,
  name,
  onChange,
  required = true,
  value,
}: {
  autoComplete: string
  className?: string
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
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label htmlFor={inputId} className="text-xs">
        {label}
      </Label>
      <Input
        id={inputId}
        name={name}
        autoComplete={autoComplete}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        required={required}
        maxLength={120}
        className="h-8"
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
