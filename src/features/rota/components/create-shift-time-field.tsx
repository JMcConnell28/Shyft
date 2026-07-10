"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import { Clock3Icon } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
        <ButtonGroup className="relative grid w-full grid-cols-[1fr_1fr_1fr] gap-0 overflow-visible rounded-xl border border-[#e2e7f0] bg-white pl-8 shadow-[0_6px_16px_rgba(30,50,96,0.035)] transition-colors focus-within:border-[#b8c3d9] focus-within:ring-2 focus-within:ring-[#11245a]/10">
          <span className="pointer-events-none absolute top-1/2 left-2.5 flex size-4 -translate-y-1/2 items-center justify-center text-[#61709a]">
            <Clock3Icon className="size-3.5" />
          </span>
          <ShiftTimeSelect
            id={`${field.name}-hour`}
            name={`${field.name}-hour`}
            value={timeParts.hour}
            aria-label={`${label} hour`}
            disabled={disabled}
            options={shiftTimeHourOptions}
            onBlur={field.handleBlur}
            onChange={(nextValue) => updateTime({ hour: nextValue })}
          />

          <ShiftTimeSelect
            id={`${field.name}-minute`}
            name={`${field.name}-minute`}
            value={timeParts.minute}
            aria-label={`${label} minutes`}
            disabled={disabled}
            options={shiftTimeMinuteOptions}
            className="border-x border-[#e2e7f0]"
            onBlur={field.handleBlur}
            onChange={(nextValue) => updateTime({ minute: nextValue })}
          />

          <ShiftTimeSelect
            id={`${field.name}-period`}
            name={`${field.name}-period`}
            value={timeParts.period}
            aria-label={`${label} period`}
            disabled={disabled}
            options={shiftTimePeriodOptions}
            onBlur={field.handleBlur}
            onChange={(nextValue) =>
              updateTime({
                period: nextValue as ShiftTimeParts["period"],
              })
            }
          />
        </ButtonGroup>
        <FieldError>{getFieldError(field)}</FieldError>
      </FieldContent>
    </Field>
  )
}

type ShiftTimeSelectOption = {
  label: string
  value: string
}

type ShiftTimeSelectProps = {
  "aria-label": string
  disabled?: boolean
  id: string
  name: string
  options: ReadonlyArray<ShiftTimeSelectOption>
  value: string
  className?: string
  onBlur: () => void
  onChange: (value: string) => void
}

function ShiftTimeSelect({
  "aria-label": ariaLabel,
  disabled = false,
  id,
  name,
  options,
  value,
  className,
  onBlur,
  onChange,
}: ShiftTimeSelectProps) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? ""

  return (
    <div className={className}>
      <NativeSelect
        id={id}
        name={name}
        value={value}
        aria-label={ariaLabel}
        disabled={disabled}
        className="w-full border-0 bg-transparent sm:hidden [&_[data-slot=native-select]]:h-10 [&_[data-slot=native-select]]:rounded-none [&_[data-slot=native-select]]:border-0 [&_[data-slot=native-select]]:bg-transparent [&_[data-slot=native-select]]:px-1 [&_[data-slot=native-select]]:text-xs [&_[data-slot=native-select]]:font-bold [&_[data-slot=native-select]]:text-[#11245a] [&_[data-slot=native-select]]:shadow-none [&_[data-slot=native-select]]:focus-visible:ring-0"
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      <Select
        disabled={disabled}
        value={value}
        onValueChange={(nextValue) => {
          if (typeof nextValue === "string") {
            onChange(nextValue)
          }
        }}
      >
        <SelectTrigger
          id={`${id}-desktop`}
          aria-label={ariaLabel}
          onBlur={onBlur}
          className="hidden h-10 w-full cursor-pointer rounded-none border-0 bg-transparent px-1 text-xs font-bold text-[#11245a] shadow-none hover:bg-[#f8faff] focus-visible:border-0 focus-visible:ring-0 sm:flex [&_[data-slot=select-value]]:justify-center [&_[data-slot=select-value]]:font-bold [&_[data-slot=select-value]]:text-[#11245a] [&>svg]:mr-1 [&>svg]:text-[#7a86a4]"
        >
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent
          align="center"
          alignItemWithTrigger
          className="max-h-64 rounded-[12px] border border-[#dfe5f0] bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] ring-0"
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="min-h-8 cursor-pointer rounded-[8px] px-2.5 py-1.5 text-xs font-semibold text-[#11245a] outline-none focus:bg-[#f5f7fb] focus:text-[#11245a] data-[selected]:bg-[#f5f7fb] data-[selected]:text-[#11245a] [&_svg]:text-[#61709a]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export { CreateShiftTimeField }
