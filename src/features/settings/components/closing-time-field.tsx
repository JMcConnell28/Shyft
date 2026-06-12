"use client"

import {
  buildShiftTimeValue,
  parseShiftTimeParts,
  shiftTimeHourOptions,
  shiftTimeMinuteOptions,
  shiftTimePeriodOptions,
  type ShiftTimeParts,
} from "@/features/rota/utils/shift-time"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

function ClosingTimeField({
  description,
  label,
  nextDay,
  onBlur,
  onChange,
  onNextDayChange,
  value,
}: {
  description: string
  label: string
  nextDay: boolean
  onBlur: () => void
  onChange: (value: string) => void
  onNextDayChange: (value: boolean) => void
  value: string
}) {
  const timeParts = parseShiftTimeParts(value)

  function updateTime(nextParts: Partial<ShiftTimeParts>) {
    onChange(buildShiftTimeValue({ ...timeParts, ...nextParts }))
  }

  return (
    <Field>
      <FieldLabel htmlFor={`${label}-hour`}>{label}</FieldLabel>
      <FieldContent className="gap-2">
        <div className="flex gap-2">
          <NativeSelect
            id={`${label}-hour`}
            value={timeParts.hour}
            aria-label={`${label} hour`}
            onBlur={onBlur}
            onChange={(event) => updateTime({ hour: event.target.value })}
          >
            {shiftTimeHourOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          <NativeSelect
            value={timeParts.minute}
            aria-label={`${label} minutes`}
            onBlur={onBlur}
            onChange={(event) => updateTime({ minute: event.target.value })}
          >
            {shiftTimeMinuteOptions.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>

          <NativeSelect
            value={timeParts.period}
            aria-label={`${label} period`}
            onBlur={onBlur}
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
        </div>
        <Field orientation="horizontal" className="items-start gap-3">
          <Checkbox
            checked={nextDay}
            onCheckedChange={(checked) => onNextDayChange(Boolean(checked))}
            onBlur={onBlur}
          />
          <FieldContent>
            <FieldTitle>Falls into the next day</FieldTitle>
            <FieldDescription>
              Turn this on for late closes like 2am or 3am so the fallback is
              treated as after midnight instead of the same day.
            </FieldDescription>
          </FieldContent>
        </Field>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
    </Field>
  )
}

export { ClosingTimeField }
