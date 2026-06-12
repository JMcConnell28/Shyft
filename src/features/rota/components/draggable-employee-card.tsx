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
  contractHoursLabel?: string
  hoursProgress?: number
  scheduleStatus?: "under" | "balanced" | "over"
  shiftCount: number
  dragId: string
  dragData: WorkspaceDragData
  layout?: "detailed" | "compact"
  variant?: "pool" | "assigned" | "overlay"
}

function DraggableEmployeeCard({
  employee,
  hoursLabel,
  contractHoursLabel,
  hoursProgress,
  scheduleStatus,
  shiftCount,
  dragId,
  dragData,
  layout = "detailed",
  variant = "pool",
}: DraggableEmployeeCardProps) {
  return (
    <DraggableItem
      dragId={dragId}
      dragData={dragData}
      dragStateClassName="opacity-35 scale-[0.98]"
    >
      <EmployeeCard
        employee={employee}
        hoursLabel={hoursLabel}
        contractHoursLabel={contractHoursLabel}
        hoursProgress={hoursProgress}
        scheduleStatus={scheduleStatus}
        shiftCount={shiftCount}
        layout={layout}
        variant={variant}
        isDraggable
      />
    </DraggableItem>
  )
}

export default DraggableEmployeeCard
