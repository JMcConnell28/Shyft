import type * as React from "react"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function WizardQuestion({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  )
}

function ChoiceButton({
  checked,
  onClick,
  icon,
  title,
  description,
}: {
  checked: boolean
  onClick: () => void
  icon?: React.ReactNode
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      data-selected={checked}
      onClick={onClick}
      className={cn(
        "group flex min-h-16 w-full items-start gap-3 rounded-lg border border-border/70 bg-background p-3 text-left transition-[border-color,background-color,box-shadow,transform] duration-150 hover:border-primary/40 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none motion-reduce:transition-none",
        "data-[selected=true]:scale-[1.01] data-[selected=true]:border-primary/50 data-[selected=true]:bg-primary/5 data-[selected=true]:shadow-sm"
      )}
    >
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/30 text-muted-foreground transition-colors group-data-[selected=true]:border-primary/40 group-data-[selected=true]:text-primary">
        {icon ?? <CheckIcon className="size-4" />}
      </span>
      <span className="min-w-0 space-y-1">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-3 py-2.5 text-sm sm:grid-cols-[8rem_1fr] sm:gap-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

export { ChoiceButton, SummaryRow, WizardQuestion }
