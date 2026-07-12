import { InfoIcon, SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const metricTones = {
  blue: "bg-[#eef3ff] text-[#0968f5]",
  green: "bg-[#ebf9ee] text-[#20a54a]",
  purple: "bg-[#f3edff] text-[#7c3aed]",
} as const

function ResourcePageHeader({
  action,
  description,
  title,
}: {
  action: React.ReactNode
  description: string
  title: string
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-[1.75rem] leading-none font-extrabold tracking-[-0.045em] text-[#0d204f] md:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm font-medium text-[#61709a]">{description}</p>
      </div>
      {action ? (
        <div className="[&_[data-slot=button]]:h-10 [&_[data-slot=button]]:w-full [&_[data-slot=button]]:rounded-lg [&_[data-slot=button]]:bg-[#0867f2] [&_[data-slot=button]]:px-4 [&_[data-slot=button]]:text-sm [&_[data-slot=button]]:font-semibold sm:[&_[data-slot=button]]:w-auto">
          {action}
        </div>
      ) : null}
    </header>
  )
}

function ResourceMetric({
  icon: Icon,
  label,
  tone = "blue",
  value,
}: {
  icon: typeof InfoIcon
  label: string
  tone?: keyof typeof metricTones
  value: number
}) {
  return (
    <div className="flex min-h-20 items-center gap-3 rounded-xl border border-[#dfe5f0] bg-white px-4 py-3 shadow-[0_6px_18px_rgba(30,50,96,0.035)]">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          metricTones[tone]
        )}
      >
        <Icon className="size-5" />
      </span>
      <span>
        <strong className="block text-lg leading-none font-extrabold text-[#0d204f]">
          {value}
        </strong>
        <span className="mt-1 block text-xs font-medium text-[#61709a]">
          {label}
        </span>
      </span>
    </div>
  )
}

function ResourceSearch({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{placeholder}</span>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#61709a]" />
      <Input
        type="search"
        className="h-10 rounded-lg border-[#dfe5f0] bg-white pl-9 text-sm shadow-none"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function ResourceInfo({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#f1f5ff] px-4 py-3 text-xs leading-relaxed font-medium text-[#405889]">
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-[#0968f5]" />
      <p>{children}</p>
    </div>
  )
}

export { ResourceInfo, ResourceMetric, ResourcePageHeader, ResourceSearch }
