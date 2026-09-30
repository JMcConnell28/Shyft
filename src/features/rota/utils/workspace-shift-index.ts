import type {
  WorkspaceDay,
  WorkspaceLocation,
  WorkspaceShift,
} from "@/features/rota/types/workspace"
import { compareShiftsByTime } from "@/features/rota/utils/workspace-shifts"

function indexWorkspaceShifts({
  days,
  location,
  selectedZoneId,
  shiftsById,
}: {
  days: Array<WorkspaceDay>
  location: WorkspaceLocation
  selectedZoneId: string
  shiftsById: Record<string, WorkspaceShift>
}) {
  const allShiftIdsByDayId: Record<string, Array<string>> = {}
  const visibleShiftsByDayId: Record<string, Array<WorkspaceShift>> = {}

  for (const day of days) {
    allShiftIdsByDayId[day.id] = []
    visibleShiftsByDayId[day.id] = []
  }

  for (const shift of Object.values(shiftsById)) {
    if (!Object.hasOwn(allShiftIdsByDayId, shift.dayId)) continue
    allShiftIdsByDayId[shift.dayId].push(shift.id)
    if (selectedZoneId === "all" || shift.zoneId === selectedZoneId) {
      visibleShiftsByDayId[shift.dayId].push(shift)
    }
  }

  const visibleShiftIdsByDayId = Object.fromEntries(
    days.map((day) => [
      day.id,
      visibleShiftsByDayId[day.id]
        .sort((left, right) => compareShiftsByTime(left, right, location))
        .map((shift) => shift.id),
    ])
  )

  return { allShiftIdsByDayId, visibleShiftIdsByDayId }
}

export { indexWorkspaceShifts }
