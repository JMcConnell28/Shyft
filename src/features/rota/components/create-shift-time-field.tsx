"use client"

import type { AnyFieldApi } from "@tanstack/react-form"

import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  buildShiftTimeValue,
  parseShiftTimeParts,
  shiftTimeHourOptions,
  shiftTimeMinuteOptions,
  shiftTimePeriodOptions,
  type ShiftTimeParts,
} from "@/features/rota/utils/shift-time"
import { getFieldError } from "@/lib/forms"

type CreateShiftTimeFieldProps = {
  field: AnyFieldApi
  label: string
}

function CreateShiftTimeField({ field, label }: CreateShiftTimeFieldProps) {
  const timeValue = typeof field.state.value === "string" ? field.state.value : ""
  const timeParts = parseShiftTimeParts(timeValue)

  function updateTime(nextParts: Partial<ShiftTimeParts>) {
    field.handleChange(buildShiftTimeValue({ ...timeParts, ...nextParts }))
  }

  return (
    <Field>
      <FieldLabel htmlFor={`${field.name}-hour`}>{label}</FieldLabel>
      <FieldContent className="gap-2">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_4.5rem] gap-2">
          <NativeSelect
            id={`${field.name}-hour`}
            name={`${field.name}-hour`}
            value={timeParts.hour}
            aria-label={`${label} hour`}
            onBlur={field.handleBlur}
            onChange={(event) => updateTime({ hour: event.target.value })}
          >
            {shiftTimeHourOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          <NativeSelect
            id={`${field.name}-minute`}
            name={`${field.name}-minute`}
            value={timeParts.minute}
            aria-label={`${label} minutes`}
            onBlur={field.handleBlur}
            onChange={(event) => updateTime({ minute: event.target.value })}
          >
            {shiftTimeMinuteOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          <NativeSelect
            id={`${field.name}-period`}
            name={`${field.name}-period`}
            value={timeParts.period}
            aria-label={`${label} period`}
            onBlur={field.handleBlur}
            onChange={(event) =>
              updateTime({ period: event.target.value as ShiftTimeParts["period"] })
            }
          >
            {shiftTimePeriodOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <FieldError>{getFieldError(field)}</FieldError>
      </FieldContent>
    </Field>
  )
}

export { CreateShiftTimeField }
