"use client"

import type { AnyFieldApi } from "@tanstack/react-form"

import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getFieldError } from "@/lib/forms"

type CreateShiftTypeFieldProps = {
  field: AnyFieldApi
  onValueChange?: (value: "standard" | "split") => void
}

const shiftTypeOptions = [
  { label: "Standard", value: "standard" },
  { label: "Split", value: "split" },
] as const

function CreateShiftTypeField({
  field,
  onValueChange,
}: CreateShiftTypeFieldProps) {
  return (
    <Field>
      <FieldLabel>Shift type</FieldLabel>
      <FieldContent className="gap-2">
        <ToggleGroup
          spacing={2}
          value={
            typeof field.state.value === "string" && field.state.value.length > 0
              ? [field.state.value]
              : []
          }
          onBlur={field.handleBlur}
          onValueChange={(value) => {
            const nextValue = Array.isArray(value) ? value[0] : undefined

            if (
              nextValue === "standard" ||
              nextValue === "split"
            ) {
              field.handleChange(nextValue)
              onValueChange?.(nextValue)
            }
          }}
          className="grid w-full grid-cols-2 rounded-lg bg-muted/50 p-1"
        >
          {shiftTypeOptions.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              variant="outline"
              size="lg"
              className="min-h-9 rounded-md border-transparent bg-transparent px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-none hover:bg-background/70 hover:text-foreground aria-pressed:border-border aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldError>{getFieldError(field)}</FieldError>
      </FieldContent>
    </Field>
  )
}

export { CreateShiftTypeField }
