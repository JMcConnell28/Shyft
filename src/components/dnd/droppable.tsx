import { useDroppable } from "@dnd-kit/core"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DroppableProps = {
  id: string
  children: ReactNode
  className?: string
  disabled?: boolean
  data?: Record<string, unknown>
}

function Droppable({
  id,
  children,
  className,
  disabled = false,
  data,
}: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
    data,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-colors",
        isOver && "ring-2 ring-primary/40",
        className
      )}
    >
      {children}
    </div>
  )
}

export { Droppable }
