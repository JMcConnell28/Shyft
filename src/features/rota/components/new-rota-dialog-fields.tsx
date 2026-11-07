import { rotaListSelectClassName } from "../constants/rota-list-styles"
import type { ComponentType } from "react"
import { buttonVariants } from "@/components/ui/button"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

type DialogSelectOption = { label: string; value: string }
type DialogSelectRowProps = {
  disabled?: boolean
  error?: string
  icon?: ComponentType<{ className?: string }>
  id: string
  label: string
  options: Array<DialogSelectOption>
  value: string
  onBlur: () => void
  onChange: (value: string) => void
}

function DialogSelectRow({
  disabled = false,
  error,
  icon: Icon,
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
    <div className="min-w-0">
      <div className="relative sm:hidden">
        {Icon && (
          <Icon className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <NativeSelect
          id={id}
          name={id}
          aria-label={label}
          aria-invalid={Boolean(error)}
          value={value}
          disabled={disabled}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          className={cn(rotaListSelectClassName, Icon && "[&_select]:pl-9")}
        >
          {options.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <Select
        disabled={disabled}
        value={value}
        onValueChange={(next) => {
          if (typeof next === "string") onChange(next)
        }}
      >
        <SelectTrigger
          id={id + "-desktop"}
          aria-label={label}
          aria-invalid={Boolean(error)}
          onBlur={onBlur}
          className={cn(
            buttonVariants({ variant: "secondary" }),
            "hidden w-full min-w-0 sm:flex"
          )}
        >
          {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
          <SelectValue className="min-w-0 flex-1 truncate text-left">
            {selectedLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger={false}
          className="max-h-64"
        >
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  )
}

function TemplateSelect({
  templates,
  ...props
}: Omit<
  DialogSelectRowProps,
  "id" | "label" | "options" | "icon" | "disabled"
> & { templates: Array<{ id: string; name: string }> }) {
  return (
    <DialogSelectRow
      {...props}
      id="new-rota-template"
      label="Template"
      options={[
        { value: "", label: "Choose a template" },
        ...templates.map((template) => ({
          value: template.id,
          label: template.name,
        })),
      ]}
    />
  )
}

export { DialogSelectRow, TemplateSelect }
export type { DialogSelectOption }
