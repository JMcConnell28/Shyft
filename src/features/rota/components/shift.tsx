"use client"

import { useDroppable } from "@dnd-kit/core"

import DraggableAssignedEmployeeName from "@/features/rota/components/draggable-assigned-employee-name"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { cn } from "@/lib/utils"

function Shift({ shiftId }: { shiftId: string }) {
  const { assignmentIdsByShiftId, assignmentsById, getEmployee, shiftsById } =
    useRotaWorkspace()
  const shift = shiftsById[shiftId]
  const assignmentIds = assignmentIdsByShiftId[shiftId] ?? []
  const { isOver, setNodeRef } = useDroppable({
    id: shiftId,
    data: {
      type: "shift",
      shiftId,
    },
  })

  if (!shift) {
    return null
  }

  return (
    <div ref={setNodeRef} className="space-y-1">
      <div
        className={cn(
          "rounded-md border border-border/70 bg-background px-2 py-1 shadow-sm transition-colors",
          isOver ? "border-primary bg-primary/5" : undefined
        )}
      >
        <p className="truncate text-[11px] font-semibold text-foreground">
          {shift.startTime} - {shift.endTime}
        </p>
      </div>

      <div className="mb-3 flex flex-col items-center space-y-0.5">
        {assignmentIds.map((assignmentId) => {
          const assignment = assignmentsById[assignmentId]
          const employee = assignment
            ? getEmployee(assignment.employeeId)
            : undefined

          if (!assignment || !employee) {
            return null
          }

          return (
            <DraggableAssignedEmployeeName
              key={assignment.id}
              employee={employee}
              dragId={`assignment-${assignment.id}`}
              dragData={{
                type: "assignment",
                assignmentId: assignment.id,
                employeeId: assignment.employeeId,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default Shift
