import { ChevronDownIcon } from "lucide-react"
import type { ComponentType } from "react"

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type DialogSelectOption = {
  label: string
  value: string
}

type DialogSelectRowProps = {
  disabled?: boolean
  error?: string
  icon: ComponentType<{ className?: string }>
  iconTone: "green" | "blue"
  id: string
  label: string
  options: Array<DialogSelectOption>
  value: string
  onBlur: () => void
  onChange: (value: string) => void
}

type TemplateSelectProps = {
  error?: string
  templates: Array<{ id: string; name: string }>
  value: string
  onBlur: () => void
  onChange: (value: string) => void
}

function DialogSelectRow({
  disabled = false,
  error,
  icon: Icon,
  iconTone,
  id,
  label,
  options,
  value,
  onBlur,
  onChange,
}: DialogSelectRowProps) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? ""

  return (
    <div className="block">
      <div className="relative flex min-h-12 items-center gap-2.5 rounded-[10px] border border-[#dfe5f0] bg-[#fbfcff] px-3 py-2 shadow-[0_5px_16px_rgba(30,50,96,0.045)]">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-[9px]",
            iconTone === "green"
              ? "bg-[#e1f8eb] text-[#00a84f]"
              : "bg-[#eaf0ff] text-[#174ef4]"
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <label
            htmlFor={id}
            className="block text-[11px] leading-none font-semibold text-[#7a86a4]"
          >
            {label}
          </label>
          <NativeSelect
            id={id}
            name={id}
            value={value}
            disabled={disabled}
            onBlur={onBlur}
            onChange={(event) => onChange(event.target.value)}
            className="mt-1 w-full sm:hidden [&_[data-slot=native-select-icon]]:hidden [&_select]:h-auto [&_select]:border-0 [&_select]:bg-transparent [&_select]:p-0 [&_select]:pr-6 [&_select]:text-[13px] [&_select]:font-bold [&_select]:text-[#11245a] [&_select]:shadow-none"
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
              onBlur={onBlur}
              className="mt-1 hidden h-auto w-full min-w-0 cursor-pointer border-0 bg-transparent p-0 pr-6 text-[13px] font-bold text-[#11245a] shadow-none hover:bg-transparent focus-visible:border-0 focus-visible:ring-0 sm:flex [&_[data-slot=select-value]]:block [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:overflow-hidden [&_[data-slot=select-value]]:text-[13px] [&_[data-slot=select-value]]:leading-tight [&_[data-slot=select-value]]:font-bold [&_[data-slot=select-value]]:text-ellipsis [&_[data-slot=select-value]]:whitespace-nowrap [&_[data-slot=select-value]]:text-[#11245a] [&>svg]:hidden"
            >
              <SelectValue>{selectedLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent
              align="start"
              alignItemWithTrigger
              className="max-h-64 rounded-[12px] border border-[#dfe5f0] bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] ring-0"
            >
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="min-h-8 cursor-pointer rounded-[8px] px-2.5 py-1.5 text-xs font-semibold text-[#11245a] outline-none focus:bg-[#eef4ff] focus:text-[#11245a] data-[selected]:bg-[#eef4ff] data-[selected]:text-[#0069ff] [&_svg]:text-[#0069ff]"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-[#7a86a4]" />
      </div>
      <FieldErrorMessage message={error} />
    </div>
  )
}

function TemplateSelect({
  error,
  templates,
  value,
  onBlur,
  onChange,
}: TemplateSelectProps) {
  const options = [
    {
      value: "",
      label: "Choose a template",
    },
    ...templates.map((template) => ({
      value: template.id,
      label: template.name,
    })),
  ]
  const selectedLabel =
    options.find((option) => option.value === value)?.label ??
    "Choose a template"

  return (
    <div className="block">
      <label
        htmlFor="new-rota-template"
        className="mb-1.5 block text-xs font-semibold text-[#7a86a4]"
      >
        Template
      </label>
      <NativeSelect
        id="new-rota-template"
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        className="w-full sm:hidden [&_select]:h-10 [&_select]:rounded-[10px] [&_select]:border-[#dfe5f0] [&_select]:bg-[#fbfcff] [&_select]:px-3 [&_select]:text-[13px] [&_select]:font-bold [&_select]:text-[#11245a] [&_select]:shadow-[0_5px_16px_rgba(30,50,96,0.045)]"
      >
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (typeof nextValue === "string") {
            onChange(nextValue)
          }
        }}
      >
        <SelectTrigger
          id="new-rota-template-desktop"
          onBlur={onBlur}
          className="hidden h-10 w-full cursor-pointer rounded-[10px] border border-[#dfe5f0] bg-[#fbfcff] px-3 text-[13px] font-bold text-[#11245a] shadow-[0_5px_16px_rgba(30,50,96,0.045)] hover:bg-white focus-visible:border-[#b8c3d9] focus-visible:ring-2 focus-visible:ring-[#0069ff]/10 sm:flex [&_[data-slot=select-value]]:font-bold [&_[data-slot=select-value]]:text-[#11245a]"
        >
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger
          className="max-h-64 rounded-[12px] border border-[#dfe5f0] bg-white p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.16)] ring-0"
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="min-h-8 cursor-pointer rounded-[8px] px-2.5 py-1.5 text-xs font-semibold text-[#11245a] outline-none focus:bg-[#eef4ff] focus:text-[#11245a] data-[selected]:bg-[#eef4ff] data-[selected]:text-[#0069ff] [&_svg]:text-[#0069ff]"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldErrorMessage message={error} />
    </div>
  )
}

function FieldErrorMessage({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return (
    <p className="mt-1.5 px-1 text-xs font-medium text-destructive">
      {message}
    </p>
  )
}

export { DialogSelectRow, TemplateSelect }
export type { DialogSelectOption }
