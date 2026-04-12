"use client"

import AssignedEmployeeName from "@/features/rota/components/assigned-employee-name"
import DraggableItem from "@/features/rota/components/draggable-item"
import type {
  WorkspaceDragData,
  WorkspaceEmployee,
} from "@/features/rota/types/workspace"

function DraggableAssignedEmployeeName({
  employee,
  dragData,
  dragId,
}: {
  employee: WorkspaceEmployee
  dragData: WorkspaceDragData
  dragId: string
}) {
  return (
    <DraggableItem dragId={dragId} dragData={dragData}>
      <AssignedEmployeeName employee={employee} isDragging />
    </DraggableItem>
  )
}

export default DraggableAssignedEmployeeName
