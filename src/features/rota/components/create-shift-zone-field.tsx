"use client"

import type { AnyFieldApi } from "@tanstack/react-form"

import { SelectFormField } from "@/components/forms/select-form-field"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
        <ToggleGroup
          spacing={2}
          value={
            typeof field.state.value === "string" &&
            field.state.value.length > 0
              ? [field.state.value]
              : []
          }
          onBlur={field.handleBlur}
          onValueChange={(value) => {
            const nextValue = Array.isArray(value) ? value[0] : undefined

            if (typeof nextValue === "string" && nextValue.length > 0) {
              field.handleChange(nextValue)
            }
          }}
          className={cn(
            "grid w-full gap-2",
            getZoneGridClassName(zones.length)
          )}
        >
          {zones.map((zone) => {
            return (
              <ToggleGroupItem
                key={zone.id}
                value={zone.id}
                variant="outline"
                size="lg"
                className="min-h-10 w-full min-w-0 cursor-pointer rounded-lg border-border/70 bg-background px-3 py-1.5 text-center text-sm font-medium shadow-sm shadow-transparent hover:bg-muted/40 aria-pressed:border-primary/60 aria-pressed:bg-primary/10 aria-pressed:text-primary aria-pressed:shadow-primary/10"
                title={zone.name}
              >
                <span className="block w-full truncate">{zone.name}</span>
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
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
