"use client"

import { useDroppable } from "@dnd-kit/core"
import AssignedEmployeeName from "@/features/rota/components/assigned-employee-name"
import DraggableAssignedEmployeeName from "@/features/rota/components/draggable-assigned-employee-name"
import { ShiftActionsMenu } from "@/features/rota/components/shift-actions-menu"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { getShiftDisplayLines } from "@/features/rota/utils/workspace-shifts"
import { cn } from "@/lib/utils"

function Shift({
  shiftId,
  readOnly = false,
}: {
  shiftId: string
  readOnly?: boolean
}) {
  const {
    assignmentIdsByShiftId,
    assignmentsById,
    getEmployee,
    meta,
    shiftsById,
    zones,
    days,
    selectedLocation,
  } = useRotaWorkspace()
  const shift = shiftsById[shiftId]
  const assignmentIds = assignmentIdsByShiftId[shiftId] ?? []
  const canEdit = !readOnly && meta.canEdit
  const droppable = useDroppable({
    id: shiftId,
    data: { type: "shift", shiftId },
    disabled: !canEdit,
  })
  const zoneLabel =
    zones.find((zone) => zone.id === shift.zoneId)?.name ??
    shift.zoneName ??
    "Shift"
  const timeLines = getShiftDisplayLines(shift)
  const day = days.find((entry) => entry.id === shift.dayId)
  const shiftLabel = [
    day ? [day.shortLabel, day.dayNumber, day.monthLabel].join(" ") : "",
    timeLines.join(" / "),
    zoneLabel,
    selectedLocation.name,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div
      ref={canEdit ? droppable.setNodeRef : undefined}
      className={cn(
        "space-y-0.5",
        canEdit && droppable.isOver && "border-[#0069ff] bg-[#eef3ff]"
      )}
    >
      <div className="flex min-h-7 w-full items-center justify-between gap-1 rounded-sm border border-[#edf0f6] bg-card px-2 shadow-xs transition-colors">
        <div className="min-w-0 flex-1 py-1 text-[10px] font-extrabold tracking-[-0.015em] text-[#11245a]">
          {timeLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        {canEdit ? (
          <ShiftActionsMenu
            shiftId={shiftId}
            shiftLabel={shiftLabel}
            assignmentCount={assignmentIds.length}
          />
        ) : null}
      </div>
      <div className="flex w-full flex-col items-center justify-center">
        {assignmentIds.length === 0 ? (
          <p className="text-[10px] font-medium text-[#7a86a4]">
            No one assigned yet
          </p>
        ) : (
          assignmentIds.map((assignmentId) => {
            const assignment = assignmentsById[assignmentId]
            const employee = getEmployee(assignment.employeeId)
            if (!employee) return null
            return canEdit ? (
              <DraggableAssignedEmployeeName
                key={assignment.id}
                employee={employee}
                dragId={"assignment-" + assignment.id}
                dragData={{
                  type: "assignment",
                  assignmentId: assignment.id,
                  employeeId: assignment.employeeId,
                }}
              />
            ) : (
              <AssignedEmployeeName key={assignment.id} employee={employee} />
            )
          })
        )}
      </div>
    </div>
  )
}

export default Shift
