import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type DraggableProps = {
  id: string
  children: ReactNode
  className?: string
  disabled?: boolean
  data?: Record<string, unknown>
}

function Draggable({
  id,
  children,
  className,
  disabled = false,
  data,
}: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled,
      data,
    })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("touch-none", isDragging && "z-50 opacity-70", className)}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}

export { Draggable }
