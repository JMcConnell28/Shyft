import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import ZonePicker from "@/features/rota/components/zone-picker"

function RotaViewToolbar() {
  const { days, selectedLocation } = useRotaWorkspace()
  const weekRangeLabel = getWeekRangeLabel(days)

  return (
    <div className="flex min-h-14 w-full shrink-0 items-center justify-between gap-3 px-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex min-w-0 flex-col justify-center rounded-xl bg-card px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {selectedLocation?.name ?? "Location"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {weekRangeLabel}
          </span>
        </div>
      </div>
      <div className="shrink-0">
        <ZonePicker />
      </div>
    </div>
  )
}

function getWeekRangeLabel(days: ReturnType<typeof useRotaWorkspace>["days"]) {
  const firstDay = days[0]
  const lastDay = days[days.length - 1]

  if (!firstDay || !lastDay) {
    return "Week"
  }

  if (firstDay.monthLabel === lastDay.monthLabel) {
    return `${firstDay.dayNumber} - ${lastDay.dayNumber} ${lastDay.monthLabel}`
  }

  return `${firstDay.dayNumber} ${firstDay.monthLabel} - ${lastDay.dayNumber} ${lastDay.monthLabel}`
}

export default RotaViewToolbar
