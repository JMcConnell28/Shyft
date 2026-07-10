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
        "flex w-full min-w-0 items-center justify-center gap-1.5 truncate rounded-md px-0.5 py-0.5 text-[11px] leading-4 font-semibold text-[#11245a] transition-colors",
        isDragging
          ? "cursor-grab touch-none select-none hover:bg-muted active:cursor-grabbing"
          : undefined
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          groupAppearance.dotClassName
        )}
      />
      <span className="truncate">{employee.name}</span>
    </div>
  )
}

export default AssignedEmployeeName
