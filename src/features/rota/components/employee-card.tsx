"use client"

import type { WorkspaceEmployee } from "@/features/rota/types/workspace"
import { cn } from "@/lib/utils"

type EmployeeCardProps = {
  employee: WorkspaceEmployee
  hoursLabel: string
  shiftCount: number
  intent?: "default" | "remove"
  layout?: "detailed" | "compact"
  variant?: "pool" | "assigned" | "overlay"
  isDraggable?: boolean
}

function EmployeeCard({
  employee,
  hoursLabel,
  shiftCount,
  intent = "default",
  layout = "detailed",
  variant = "pool",
  isDraggable = false,
}: EmployeeCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border border-border/70 bg-background text-left shadow-sm transition-[transform,box-shadow]",
        layout === "compact" ? "px-2 py-1.5" : "px-2.5 py-2",
        isDraggable
          ? "cursor-grab touch-none select-none active:cursor-grabbing"
          : undefined,
        variant === "assigned" ? "bg-card/80" : undefined,
        variant === "overlay"
          ? "scale-105 shadow-lg ring-2 ring-primary/20"
          : undefined,
        intent === "remove"
          ? "border-red-200 bg-red-50 ring-2 ring-red-200"
          : undefined
      )}
    >
      {layout === "compact" ? (
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-xs font-medium",
              intent === "remove" ? "text-red-950" : "text-foreground"
            )}
          >
            {employee.name}
          </p>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-xs font-medium",
                intent === "remove" ? "text-red-950" : "text-foreground"
              )}
            >
              {employee.name}
            </p>
            <div
              className={cn(
                "mt-1 flex items-center gap-2 text-[11px]",
                intent === "remove" ? "text-red-800" : "text-muted-foreground"
              )}
            >
              <span>{hoursLabel}</span>
              <span>{shiftCount} shifts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export type { EmployeeCardProps }
export default EmployeeCard
