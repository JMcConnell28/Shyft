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
          variant="outline"
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
          className="grid w-full grid-cols-4 gap-1.5 sm:grid-cols-7"
        >
          {days.map((day) => {
            return (
              <ToggleGroupItem
                key={day.id}
                value={day.id}
                variant="outline"
                size="sm"
                className={cn(
                  "min-h-9 w-full cursor-pointer rounded-lg border-[#e2e7f0] bg-white px-1 py-1.5 text-center text-xs font-bold text-[#11245a] shadow-none hover:border-[#c8cfdd] hover:bg-[#f8faff] aria-pressed:border-[#b8c3d9] aria-pressed:bg-[#f5f7fb] aria-pressed:text-[#11245a] aria-pressed:shadow-[0_6px_14px_rgba(30,50,96,0.07)]"
                )}
                aria-label={`${day.shortLabel} ${day.dayNumber} ${day.monthLabel}`}
              >
                {day.shortLabel}
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
