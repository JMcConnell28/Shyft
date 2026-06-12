"use client"

import type { WorkspaceEmployee } from "@/features/rota/types/workspace"
import { getEmployeeGroupAppearance } from "@/features/rota/utils/employee-group-appearance"
import { cn } from "@/lib/utils"

function AssignedEmployeeName({
  employee,
  isDragging = false,
}: {
  employee: WorkspaceEmployee
  isDragging?: boolean
}) {
  const groupAppearance = getEmployeeGroupAppearance(employee.groupColor)

  return (
    <div
      className={cn(
        "flex items-center gap-1 truncate rounded-sm px-1 text-[11px] leading-4 text-foreground/85 transition-colors hover:bg-muted hover:text-foreground",
        isDragging
          ? "cursor-grab touch-none select-none active:cursor-grabbing"
          : undefined
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", groupAppearance.dotClassName)}
      />
      <span className="truncate">{employee.name}</span>
    </div>
  )
}

export default AssignedEmployeeName
