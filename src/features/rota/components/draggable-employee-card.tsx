"use client"

import DraggableItem from "@/features/rota/components/draggable-item"
import EmployeeCard from "@/features/rota/components/employee-card"
import type {
  WorkspaceDragData,
  WorkspaceEmployee,
} from "@/features/rota/types/workspace"

type DraggableEmployeeCardProps = {
  employee: WorkspaceEmployee
  hoursLabel: string
  shiftCount: number
  dragId: string
  dragData: WorkspaceDragData
  layout?: "detailed" | "compact"
  variant?: "pool" | "assigned" | "overlay"
}

function DraggableEmployeeCard({
  employee,
  hoursLabel,
  shiftCount,
  dragId,
  dragData,
  layout = "detailed",
  variant = "pool",
}: DraggableEmployeeCardProps) {
  return (
    <DraggableItem dragId={dragId} dragData={dragData}>
      <EmployeeCard
        employee={employee}
        hoursLabel={hoursLabel}
        shiftCount={shiftCount}
        layout={layout}
        variant={variant}
        isDraggable
      />
    </DraggableItem>
  )
}

export default DraggableEmployeeCard
