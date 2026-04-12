"use client"

import type { AnyFieldApi } from "@tanstack/react-form"

import { SelectFormField } from "@/components/forms/select-form-field"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import type { WorkspaceZone } from "@/features/rota/types/workspace"
import { getFieldError } from "@/lib/forms"
import { cn } from "@/lib/utils"

type CreateShiftZoneFieldProps = {
  field: AnyFieldApi
  zones: WorkspaceZone[]
}

function CreateShiftZoneField({ field, zones }: CreateShiftZoneFieldProps) {
  if (zones.length > 3) {
    return (
      <SelectFormField
        field={field}
        label="Zone"
        placeholder="Choose a zone"
        options={zones.map((zone) => ({
          label: zone.name,
          value: zone.id,
        }))}
      />
    )
  }

  return (
    <Field>
      <FieldLabel>Zone</FieldLabel>
      <FieldContent className="gap-2">
        <div className={cn("grid gap-2", getZoneGridClassName(zones.length))}>
          {zones.map((zone) => {
            const inputId = `${field.name}-${zone.id}`
            const isSelected = field.state.value === zone.id

            return (
              <label key={zone.id} htmlFor={inputId} className="block cursor-pointer">
                <input
                  id={inputId}
                  name={field.name}
                  type="radio"
                  value={zone.id}
                  checked={isSelected}
                  className="sr-only"
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <span
                  className={cn(
                    "flex min-h-11 items-center justify-center rounded-xl border px-3 py-2 text-center text-sm font-medium transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/70 bg-background hover:bg-muted/40"
                  )}
                >
                  {zone.name}
                </span>
              </label>
            )
          })}
        </div>
        <FieldError>{getFieldError(field)}</FieldError>
      </FieldContent>
    </Field>
  )
}

function getZoneGridClassName(zoneCount: number) {
  if (zoneCount <= 1) {
    return "grid-cols-1"
  }

  if (zoneCount === 2) {
    return "grid-cols-2"
  }

  return "grid-cols-3"
}

export { CreateShiftZoneField }
