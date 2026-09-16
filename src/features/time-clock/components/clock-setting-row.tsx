import type { ReactNode } from "react"

import type { ClockSettingOption } from "@/features/time-clock/constants/clock-settings-options"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type ClockSettingRowProps = {
  children: ReactNode
  description: string
  title: string
}

function ClockSettingRow({
  children,
  description,
  title,
}: ClockSettingRowProps) {
  return (
    <div className="grid min-h-[3.5rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2">
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#14214a]">{title}</p>
        <p className="mt-0.5 text-[10px] leading-3.5 font-medium text-[#7180a2] sm:text-[11px]">
          {description}
        </p>
      </div>
      <div className="flex min-w-0 items-center justify-end">{children}</div>
    </div>
  )
}

function ClockSettingSwitch({
  checked,
  disabled,
  label,
  onCheckedChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <Switch
      aria-label={label}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
    />
  )
}

function ClockSettingSelect({
  disabled,
  label,
  onChange,
  options,
  value,
}: {
  disabled?: boolean
  label: string
  onChange: (value: string) => void
  options: Array<ClockSettingOption>
  value: string
}) {
  const resolvedOptions = options.some((option) => option.value === value)
    ? options
    : [{ label: value, value }, ...options]

  const selectedLabel =
    resolvedOptions.find((option) => option.value === value)?.label ?? value

  return (
    <Select
      disabled={disabled}
      onValueChange={(nextValue) => {
        if (typeof nextValue === "string") onChange(nextValue)
      }}
      value={value}
    >
      <SelectTrigger
        aria-label={label}
        className="h-8 min-w-32 cursor-pointer rounded-lg border-[#dce3ef] bg-white px-2.5 text-[11px] font-semibold text-[#14214a] shadow-none hover:bg-[#f9fbff] focus-visible:border-blue-500 focus-visible:ring-blue-100 sm:min-w-36"
      >
        <SelectValue>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-36">
        {resolvedOptions.map((option) => (
          <SelectItem
            className="cursor-pointer"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ClockSettingValue({
  children,
  tone = "default",
}: {
  children: ReactNode
  tone?: "default" | "positive" | "warning"
}) {
  return (
    <span
      className={cn(
        "text-xs font-bold",
        tone === "default" && "text-[#46577d]",
        tone === "positive" && "text-emerald-600",
        tone === "warning" && "text-orange-600"
      )}
    >
      {children}
    </span>
  )
}

export {
  ClockSettingRow,
  ClockSettingSelect,
  ClockSettingSwitch,
  ClockSettingValue,
}
