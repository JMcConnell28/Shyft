"use client"

import { Clock3Icon } from "lucide-react"
import type { AnyFieldApi } from "@tanstack/react-form"
import type { RotaTimeFormat } from "@/features/rota/schemas/time-format-schema"
import type { ShiftTimeParts } from "@/features/rota/types/shift-time"
import {
  buildShiftTimeValue,
  parseShiftTimeParts,
  shiftTime24HourOptions,
  shiftTimeHourOptions,
  shiftTimeMinuteOptions,
  shiftTimePeriodOptions,
} from "@/features/rota/utils/shift-time"
import { ShiftTimeSelect } from "@/features/rota/components/shift-time-select"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { ButtonGroup } from "@/components/ui/button-group"
import { getFieldError } from "@/lib/forms"
import { cn } from "@/lib/utils"

type CreateShiftTimeFieldProps = {
  field: AnyFieldApi
  label: string
  timeFormat: RotaTimeFormat
  disabled?: boolean
  className?: string
}

function CreateShiftTimeField({
  field,
  label,
  timeFormat,
  disabled = false,
  className,
}: CreateShiftTimeFieldProps) {
  const timeValue =
    typeof field.state.value === "string" ? field.state.value : ""
  const timeParts = parseShiftTimeParts(timeValue, timeFormat)
  const is12Hour = timeFormat === "12h"

  function updateTime(nextParts: Partial<ShiftTimeParts>) {
    field.handleChange(
      buildShiftTimeValue({ ...timeParts, ...nextParts }, timeFormat)
    )
  }

  return (
    <Field className={className}>
      <FieldLabel htmlFor={field.name + "-hour"}>{label}</FieldLabel>
      <FieldContent className="gap-2">
        <ButtonGroup
          className={cn(
            "relative grid w-full gap-0 overflow-visible rounded-xl border border-[#e2e7f0] bg-white pl-8 shadow-[0_6px_16px_rgba(30,50,96,0.035)] transition-colors focus-within:border-[#b8c3d9] focus-within:ring-2 focus-within:ring-[#11245a]/10",
            is12Hour ? "grid-cols-3" : "grid-cols-2"
          )}
        >
          <span className="pointer-events-none absolute top-1/2 left-2.5 flex size-4 -translate-y-1/2 items-center justify-center text-[#61709a]">
            <Clock3Icon className="size-3.5" />
          </span>
          <ShiftTimeSelect
            id={field.name + "-hour"}
            name={field.name + "-hour"}
            value={timeParts.hour}
            aria-label={label + " hour"}
            disabled={disabled}
            options={is12Hour ? shiftTimeHourOptions : shiftTime24HourOptions}
            onBlur={field.handleBlur}
            onChange={(hour) => updateTime({ hour })}
          />
          <ShiftTimeSelect
            id={field.name + "-minute"}
            name={field.name + "-minute"}
            value={timeParts.minute}
            aria-label={label + " minutes"}
            disabled={disabled}
            options={shiftTimeMinuteOptions}
            className={cn(
              "border-[#e2e7f0]",
              is12Hour ? "border-x" : "border-l"
            )}
            onBlur={field.handleBlur}
            onChange={(minute) => updateTime({ minute })}
          />
          {is12Hour ? (
            <ShiftTimeSelect
              id={field.name + "-period"}
              name={field.name + "-period"}
              value={timeParts.period}
              aria-label={label + " period"}
              disabled={disabled}
              options={shiftTimePeriodOptions}
              onBlur={field.handleBlur}
              onChange={(period) => {
                if (period === "AM" || period === "PM") updateTime({ period })
              }}
            />
          ) : null}
        </ButtonGroup>
        <FieldError>{getFieldError(field)}</FieldError>
      </FieldContent>
    </Field>
  )
}

export { CreateShiftTimeField }
