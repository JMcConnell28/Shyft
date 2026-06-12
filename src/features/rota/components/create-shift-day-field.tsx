"use client"

import type { AnyFieldApi } from "@tanstack/react-form"

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
        <ToggleGroup
          variant={"outline"}
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
          className="grid w-full grid-cols-7 gap-1.5"
        >
          {days.map((day) => {
            return (
              <ToggleGroupItem
                key={day.id}
                value={day.id}
                variant="outline"
                size="sm"
                className={cn(
                  "min-h-12 w-full cursor-pointer flex-col gap-0 rounded-lg border-border/70 bg-background px-1 py-1.5 text-center hover:bg-muted/40 aria-pressed:border-primary/60 aria-pressed:bg-primary/10 aria-pressed:text-primary aria-pressed:shadow-sm aria-pressed:shadow-primary/10"
                )}
                aria-label={`${day.shortLabel} ${day.dayNumber} ${day.monthLabel}`}
              >
                <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  {day.shortLabel}
                </span>
                <span className="mt-1 text-xs font-semibold">
                  {day.dayNumber}
                </span>
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
        <FieldError>{getFieldError(field)}</FieldError>
      </FieldContent>
    </Field>
  )
}

export { CreateShiftDayField }
