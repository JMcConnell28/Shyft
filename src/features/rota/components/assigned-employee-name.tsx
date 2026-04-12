"use client"

import type { WorkspaceEmployee } from "@/features/rota/types/workspace"
import { cn } from "@/lib/utils"

function AssignedEmployeeName({
  employee,
  isDragging = false,
}: {
  employee: WorkspaceEmployee
  isDragging?: boolean
}) {
  return (
    <div
      className={cn(
        "truncate rounded-sm px-1 text-[11px] leading-4 text-foreground/85 transition-colors",
        isDragging
          ? "cursor-grab touch-none select-none active:cursor-grabbing"
          : undefined,
        "hover:bg-muted hover:text-foreground"
      )}
    >
      {employee.name}
    </div>
  )
}

export default AssignedEmployeeName
