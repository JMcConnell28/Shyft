import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export { ShiftTimeSelect }
