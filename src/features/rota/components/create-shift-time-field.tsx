"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import {
  // eslint-disable-next-line import/consistent-type-specifier-style
  type ShiftTimeParts,
  buildShiftTimeValue,
  parseShiftTimeParts,
  shiftTimeHourOptions,
  shiftTimeMinuteOptions,
  shiftTimePeriodOptions,
} from "@/features/rota/utils/shift-time"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ButtonGroup } from "@/components/ui/button-group"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { getFieldError } from "@/lib/forms"

type CreateShiftTimeFieldProps = {
  field: AnyFieldApi
  label: string
  disabled?: boolean
  className?: string
}

function CreateShiftTimeField({
  field,
  label,
  disabled = false,
  className,
}: CreateShiftTimeFieldProps) {
  const timeValue =
    typeof field.state.value === "string" ? field.state.value : ""
  const timeParts = parseShiftTimeParts(timeValue)

  function updateTime(nextParts: Partial<ShiftTimeParts>) {
    field.handleChange(buildShiftTimeValue({ ...timeParts, ...nextParts }))
  }

  return (
    <Field className={className}>
      <FieldLabel htmlFor={`${field.name}-hour`}>{label}</FieldLabel>
      <FieldContent className="gap-2">
        <ButtonGroup className="grid w-full grid-cols-[0.9fr_0.9fr_1fr] gap-0 overflow-hidden rounded-lg border border-input bg-background shadow-sm transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
          <NativeSelect
            id={`${field.name}-hour`}
            name={`${field.name}-hour`}
            value={timeParts.hour}
            aria-label={`${label} hour`}
            disabled={disabled}
            className="w-full border-0 bg-transparent [&_[data-slot=native-select]]:h-8 [&_[data-slot=native-select]]:rounded-none [&_[data-slot=native-select]]:border-0 [&_[data-slot=native-select]]:bg-transparent [&_[data-slot=native-select]]:text-sm [&_[data-slot=native-select]]:shadow-none [&_[data-slot=native-select]]:focus-visible:ring-0"
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
            disabled={disabled}
            className="w-full cursor-pointer border-x border-input bg-transparent [&_[data-slot=native-select]]:h-8 [&_[data-slot=native-select]]:rounded-none [&_[data-slot=native-select]]:border-0 [&_[data-slot=native-select]]:bg-transparent [&_[data-slot=native-select]]:text-sm [&_[data-slot=native-select]]:shadow-none [&_[data-slot=native-select]]:focus-visible:ring-0"
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
            disabled={disabled}
            className="w-full border-0 bg-transparent [&_[data-slot=native-select]]:h-8 [&_[data-slot=native-select]]:rounded-none [&_[data-slot=native-select]]:border-0 [&_[data-slot=native-select]]:bg-transparent [&_[data-slot=native-select]]:text-sm [&_[data-slot=native-select]]:shadow-none [&_[data-slot=native-select]]:focus-visible:ring-0"
            onBlur={field.handleBlur}
            onChange={(event) =>
              updateTime({
                period: event.target.value as ShiftTimeParts["period"],
              })
            }
          >
            {shiftTimePeriodOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </ButtonGroup>
        <FieldError>{getFieldError(field)}</FieldError>
      </FieldContent>
    </Field>
  )
}

export { CreateShiftTimeField }
