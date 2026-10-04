import { useMemo } from "react"

import type { RotaRangeFilter } from "@/lib/rota-schemas"
import { useDebouncedDateSelection } from "@/hooks/use-debounced-date-selection"

type RotaDateFilters = { range: RotaRangeFilter; from?: string; to?: string }

function areDateFiltersEqual(
  first: RotaDateFilters,
  second: RotaDateFilters
): boolean {
  return (
    first.range === second.range &&
    first.from === second.from &&
    first.to === second.to
  )
}

function useRotaDateFilters({
  range,
  from,
  to,
  scopeKey,
  onRangeChange,
  onCustomRangeChange,
}: RotaDateFilters & {
  scopeKey: string
  onRangeChange: (range: RotaRangeFilter) => void
  onCustomRangeChange: (value: { from?: string; to?: string }) => void
}) {
  const value = useMemo(() => ({ range, from, to }), [range, from, to])
  const selection = useDebouncedDateSelection({
    value,
    scopeKey,
    isEqual: areDateFiltersEqual,
    onChange: (next) =>
      next.range === "custom"
        ? onCustomRangeChange({ from: next.from, to: next.to })
        : onRangeChange(next.range),
  })
  return {
    selected: selection.selectedValue,
    isPending: selection.isPending,
    changeRange: (nextRange: RotaRangeFilter) =>
      selection.updateSelection(() => ({
        range: nextRange,
        from: undefined,
        to: undefined,
      })),
    changeFrom: (nextFrom?: string) =>
      selection.updateSelection((previous) => ({
        ...previous,
        range: "custom",
        from: nextFrom,
      })),
    changeTo: (nextTo?: string) =>
      selection.updateSelection((previous) => ({
        ...previous,
        range: "custom",
        to: nextTo,
      })),
  }
}

export { useRotaDateFilters }
