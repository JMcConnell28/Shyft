"use client"

import * as React from "react"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"

import type { WorkspaceDragData } from "@/features/rota/types/workspace"
import { cn } from "@/lib/utils"

function DraggableItem({
  children,
  dragData,
  dragId,
  dragStateClassName,
}: {
  children: React.ReactNode
  dragData: WorkspaceDragData
  dragId: string
  dragStateClassName?: string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: dragData,
  })

  return (
    <div
      ref={setNodeRef}
      style={
        transform && !isDragging
          ? { transform: CSS.Translate.toString(transform) }
          : undefined
      }
      className={cn(isDragging ? dragStateClassName ?? "opacity-0" : undefined)}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}

export default DraggableItem
