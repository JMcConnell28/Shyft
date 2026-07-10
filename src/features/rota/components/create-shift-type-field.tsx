"use client"

import type { AnyFieldApi } from "@tanstack/react-form"
import { Clock3Icon, GitCommitHorizontalIcon } from "lucide-react"

import { Field, FieldContent, FieldError } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getFieldError } from "@/lib/forms"

type CreateShiftTypeFieldProps = {
  field: AnyFieldApi
  onValueChange?: (value: "standard" | "split") => void
}

const shiftTypeOptions = [
  { icon: Clock3Icon, label: "Regular", value: "standard" },
  { icon: GitCommitHorizontalIcon, label: "Split shift", value: "split" },
] as const

function CreateShiftTypeField({
  field,
  onValueChange,
}: CreateShiftTypeFieldProps) {
  return (
    <Field>
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

            if (nextValue === "standard" || nextValue === "split") {
              field.handleChange(nextValue)
              onValueChange?.(nextValue)
            }
          }}
          className="grid w-full grid-cols-2 gap-1.5 rounded-xl border border-[#e2e7f0] bg-white p-0"
        >
          {shiftTypeOptions.map((option) => {
            const Icon = option.icon

            return (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                variant="outline"
                size="lg"
                className="group min-h-10 rounded-xl border-transparent bg-transparent px-2.5 py-1.5 text-xs font-extrabold text-[#11245a] shadow-none hover:bg-[#f8faff] aria-pressed:border-[#b8c3d9] aria-pressed:bg-[#f5f7fb] aria-pressed:text-[#11245a] aria-pressed:shadow-[0_6px_16px_rgba(30,50,96,0.07)]"
              >
                <span className="mr-1.5 inline-flex size-6 items-center justify-center rounded-full bg-[#eef2f7] text-[#61709a] group-aria-pressed:bg-white group-aria-pressed:text-[#11245a]">
                  <Icon className="size-3.5" />
                </span>
                {option.label}
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
        <FieldError>{getFieldError(field)}</FieldError>
      </FieldContent>
    </Field>
  )
}

export { CreateShiftTypeField }
