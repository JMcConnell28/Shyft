"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import { Globe2Icon } from "lucide-react"

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { WorkspaceZone } from "@/features/rota/types/workspace"
import { getFieldError } from "@/lib/forms"
import { cn } from "@/lib/utils"

type CreateShiftZoneFieldProps = {
  field: AnyFieldApi
  zones: WorkspaceZone[]
}

function CreateShiftZoneField({ field, zones }: CreateShiftZoneFieldProps) {
  const zoneOptions = [
    {
      label: "Choose a zone",
      value: "",
    },
    ...zones.map((zone) => ({
      label: zone.name,
      value: zone.id,
    })),
  ]
  const selectedLabel =
    zoneOptions.find((option) => option.value === field.state.value)?.label ??
    "Choose a zone"

  if (zones.length > 3) {
    return (
      <Field>
        <FieldLabel htmlFor={field.name}>Zone</FieldLabel>
        <FieldContent className="gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-2.5 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#eef2f7] text-[#61709a]">
              <Globe2Icon className="size-3.5" />
            </span>
            <NativeSelect
              id={field.name}
              name={field.name}
              className="w-full sm:hidden [&_[data-slot=native-select]]:h-10 [&_[data-slot=native-select]]:rounded-xl [&_[data-slot=native-select]]:border-[#e2e7f0] [&_[data-slot=native-select]]:bg-white [&_[data-slot=native-select]]:pl-11 [&_[data-slot=native-select]]:text-xs [&_[data-slot=native-select]]:font-bold [&_[data-slot=native-select]]:text-[#11245a] [&_[data-slot=native-select]]:shadow-[0_6px_16px_rgba(30,50,96,0.035)] [&_[data-slot=native-select]]:focus-visible:border-[#b8c3d9] [&_[data-slot=native-select]]:focus-visible:ring-[#11245a]/10"
              value={(field.state.value ?? "") as string}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            >
              {zoneOptions.map((option) => (
                <NativeSelectOption key={option.value} value={option.value}>
                  {option.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Select
              value={(field.state.value ?? "") as string}
              onValueChange={(nextValue) => {
                if (typeof nextValue === "string") {
                  field.handleChange(nextValue)
                }
              }}
            >
              <SelectTrigger
                id={`${field.name}-desktop`}
                onBlur={field.handleBlur}
                className="hidden h-10 w-full cursor-pointer rounded-xl border border-[#e2e7f0] bg-white pr-3 pl-11 text-xs font-bold text-[#11245a] shadow-[0_6px_16px_rgba(30,50,96,0.035)] hover:bg-[#f8faff] focus-visible:border-[#b8c3d9] focus-visible:ring-2 focus-visible:ring-[#11245a]/10 sm:flex [&_[data-slot=select-value]]:font-bold [&_[data-slot=select-value]]:text-[#11245a]"
              >
                <SelectValue>{selectedLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent
                align="start"
                alignItemWithTrigger
                className="max-h-64 rounded-[12px] border border-[#dfe5f0] bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] ring-0"
              >
                {zoneOptions.map((option) => (
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
          <FieldError>{getFieldError(field)}</FieldError>
        </FieldContent>
      </Field>
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
            "grid w-full gap-1.5",
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
                disabled={zones.length === 1}
                className="group min-h-10 w-full min-w-0 cursor-pointer rounded-xl border-[#e2e7f0] bg-white px-2.5 py-1.5 text-center text-xs font-bold text-[#11245a] shadow-[0_6px_16px_rgba(30,50,96,0.035)] hover:border-[#c8cfdd] hover:bg-[#f8faff] disabled:cursor-default disabled:opacity-100 aria-pressed:border-[#b8c3d9] aria-pressed:bg-[#f5f7fb] aria-pressed:text-[#11245a] aria-pressed:shadow-[0_6px_14px_rgba(30,50,96,0.07)]"
                title={zone.name}
              >
                <span className="flex min-w-0 items-center justify-center gap-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#eef2f7] text-[#61709a] group-aria-pressed:bg-white group-aria-pressed:text-[#11245a]">
                    <Globe2Icon className="size-3" />
                  </span>
                  <span className="truncate">{zone.name}</span>
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
