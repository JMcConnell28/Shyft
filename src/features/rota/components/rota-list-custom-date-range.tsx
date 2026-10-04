import { Input } from "@/components/ui/input"
import { rotaListInputClassName } from "@/features/rota/constants/rota-list-styles"

function RotaListCustomDateRange({
  from,
  to,
  isPending,
  onFromChange,
  onToChange,
}: {
  from?: string
  to?: string
  isPending: boolean
  onFromChange: (from?: string) => void
  onToChange: (to?: string) => void
}) {
  return (
    <div
      className="grid gap-2 md:grid-cols-2 xl:max-w-md"
      aria-busy={isPending}
    >
      <Input
        type="date"
        aria-label="Rota start date"
        className={rotaListInputClassName}
        value={from ?? ""}
        onChange={(event) => onFromChange(event.target.value || undefined)}
      />
      <Input
        type="date"
        aria-label="Rota end date"
        className={rotaListInputClassName}
        value={to ?? ""}
        onChange={(event) => onToChange(event.target.value || undefined)}
      />
    </div>
  )
}

export { RotaListCustomDateRange }
