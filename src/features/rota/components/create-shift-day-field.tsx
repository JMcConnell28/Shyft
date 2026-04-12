"use client"

import type { AnyFieldApi } from "@tanstack/react-form"

import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import type { WorkspaceDay } from "@/features/rota/types/workspace"
import { getFieldError } from "@/lib/forms"
import { cn } from "@/lib/utils"

type CreateShiftDayFieldProps = {
  field: AnyFieldApi
  days: WorkspaceDay[]
}

function CreateShiftDayField({ field, days }: CreateShiftDayFieldProps) {
  return (
    <Field>
      <FieldLabel>Day</FieldLabel>
      <FieldContent className="gap-2">
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const inputId = `${field.name}-${day.id}`
            const isSelected = field.state.value === day.id

            return (
              <label key={day.id} htmlFor={inputId} className="block cursor-pointer">
                <input
                  id={inputId}
                  name={field.name}
                  type="radio"
                  value={day.id}
                  checked={isSelected}
                  className="sr-only"
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <span
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/70 bg-background hover:bg-muted/40"
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                    {day.shortLabel}
                  </span>
                  <span className="mt-1 text-xs font-medium">{day.dayNumber}</span>
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

export { CreateShiftDayField }
