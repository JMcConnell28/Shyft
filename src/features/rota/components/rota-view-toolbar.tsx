import type {
  WorkspaceBoardData,
  WorkspaceDay,
} from "@/features/rota/types/workspace"
import { canExportSageTimesheetForRota } from "@/features/rota/utils/week-utils"
import { SageTimesheetExportButton } from "@/features/timesheets/components/sage-timesheet-export-button"
import { ZoneSelect } from "@/features/rota/components/zone-select"

function RotaViewToolbar({
  boardData,
  selectedZoneId,
  onSelectZone,
}: {
  boardData: WorkspaceBoardData
  selectedZoneId: string | null
  onSelectZone: (zoneId: string) => void
}) {
  const { days, meta, location: selectedLocation, zones } = boardData
  const weekRangeLabel = getWeekRangeLabel(days)

  return (
    <div className="flex min-h-14 w-full shrink-0 items-center justify-between gap-3 px-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex min-w-0 flex-col justify-center rounded-xl bg-card px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {selectedLocation.name}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {weekRangeLabel}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            Published v{meta.contentVersion}
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
                weekStart: meta.weekStart,
              }}
              exportLocationId={selectedLocation.id}
              variant="pill"
            />
          ) : null}
          <ZoneSelect
            selectedZoneId={selectedZoneId}
            onSelectZone={onSelectZone}
            zones={zones}
          />
        </div>
      </div>
    </div>
  )
}

function getWeekRangeLabel(days: Array<WorkspaceDay>) {
  const firstDay = days.at(0)
  const lastDay = days.at(-1)

  if (!firstDay || !lastDay) {
    return "Week"
  }

  if (firstDay.monthLabel === lastDay.monthLabel) {
    return `${firstDay.dayNumber} - ${lastDay.dayNumber} ${lastDay.monthLabel}`
  }

  return `${firstDay.dayNumber} ${firstDay.monthLabel} - ${lastDay.dayNumber} ${lastDay.monthLabel}`
}

export default RotaViewToolbar
