"use client"

type ConnectionBillingChoiceProps = {
  checked: boolean
  description: string
  disabled?: boolean
  label: string
  onClick: () => void
}

function ConnectionBillingChoice({
  checked,
  description,
  disabled = false,
  label,
  onClick,
}: ConnectionBillingChoiceProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="rounded-lg border border-border/70 bg-background p-3 text-left transition-colors hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50 data-[checked=true]:border-primary/40 data-[checked=true]:bg-primary/5"
      data-checked={checked}
      onClick={onClick}
    >
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
        {description}
      </span>
    </button>
  )
}

export { ConnectionBillingChoice }
