import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { canExportSageTimesheetForRota } from "@/features/rota/utils/week-utils"
import { SageTimesheetExportButton } from "@/features/timesheets/components/sage-timesheet-export-button"
import ZonePicker from "@/features/rota/components/zone-picker"

function RotaViewToolbar() {
  const { days, meta, selectedLocation } = useRotaWorkspace()
  const weekRangeLabel = getWeekRangeLabel(days)

  return (
    <div className="flex min-h-14 w-full shrink-0 items-center justify-between gap-3 px-2">
      <div className="hidden min-w-0 items-center gap-3 md:flex">
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
        <div className="flex items-center gap-2">
          {meta.canManage && canExportSageTimesheetForRota(meta) ? (
            <SageTimesheetExportButton
              input={{
                organizationId: meta.organizationId,
                locationId:
                  meta.workspaceType === "location"
                    ? selectedLocation.id
                    : undefined,
                userId: meta.userId,
              }}
              rotaId={meta.rotaId}
              variant="pill"
            />
          ) : null}
          <ZonePicker />
        </div>
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
