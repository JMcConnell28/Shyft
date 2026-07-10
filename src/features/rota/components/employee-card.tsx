"use client"

import * as React from "react"
import { PinIcon, StickyNoteIcon } from "lucide-react"

import type { WorkspaceEmployee } from "@/features/rota/types/workspace"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Progress } from "@/components/ui/progress"
import {
  employeeRotaNoteCategoryLabels,
  employeeRotaNotePriorityLabels,
} from "@/features/company/constants/rota-notes"
import { getEmployeeGroupAppearance } from "@/features/rota/utils/employee-group-appearance"
import { cn } from "@/lib/utils"

type EmployeeCardProps = {
  employee: WorkspaceEmployee
  hoursLabel: string
  contractHoursLabel?: string
  hoursProgress?: number
  scheduleStatus?: "under" | "balanced" | "over"
  shiftCount: number
  intent?: "default" | "remove"
  layout?: "detailed" | "compact"
  variant?: "pool" | "assigned" | "overlay"
  isDraggable?: boolean
}

function EmployeeCard({
  employee,
  hoursLabel,
  contractHoursLabel,
  hoursProgress = 0,
  scheduleStatus = "under",
  shiftCount,
  intent = "default",
  layout = "detailed",
  variant = "pool",
  isDraggable = false,
}: EmployeeCardProps) {
  const groupAppearance = getEmployeeGroupAppearance(employee.groupColor)
  const rotaNotes = employee.rotaNotes ?? []
  const [notesDialogOpen, setNotesDialogOpen] = React.useState(false)
  const lastTouchTapRef = React.useRef(0)

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" || rotaNotes.length === 0) {
      return
    }

    const now = Date.now()

    if (now - lastTouchTapRef.current < 320) {
      lastTouchTapRef.current = 0
      setNotesDialogOpen(true)
      return
    }

    lastTouchTapRef.current = now
  }

  return (
    <>
      <div
        className={cn(
          "group/card relative w-full rounded-lg border border-l-4 border-[#e1e7f2] bg-white text-left shadow-[0_4px_12px_rgba(30,50,96,0.035)] transition-[transform,box-shadow] md:border-y-border/70 md:border-r-border/70 md:bg-card md:shadow-sm",
          layout === "compact" ? "px-2 py-1.5" : "px-2.5 py-2",
          groupAppearance.cardClassName,
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
        onPointerUp={handlePointerUp}
      >
        <EmployeeRotaNotesTrigger employee={employee} layout={layout} />
        {layout === "compact" ? (
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-xs font-bold",
                intent === "remove" ? "text-red-950" : "text-[#11245a]"
              )}
            >
              {employee.name}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-xs font-bold",
                    intent === "remove" ? "text-red-950" : "text-[#11245a]"
                  )}
                >
                  {employee.name}
                </p>
                <div
                  className={cn(
                    "mt-1 flex items-center gap-2 text-[11px] font-medium",
                    intent === "remove"
                      ? "text-red-800"
                      : "text-muted-foreground"
                  )}
                >
                  <span>{hoursLabel}</span>
                  {contractHoursLabel ? (
                    <span>/ {contractHoursLabel}</span>
                  ) : null}
                  <span>{shiftCount} shifts</span>
                </div>
              </div>
            </div>

            <Progress
              className="gap-1"
              value={hoursProgress}
              aria-label={`${employee.name} scheduled hours`}
            >
              <div className="flex w-full items-center justify-between text-[10px] text-muted-foreground">
                <span>Scheduled load</span>
                <span
                  className={cn(
                    scheduleStatus === "over"
                      ? "text-rose-700"
                      : scheduleStatus === "balanced"
                        ? "text-emerald-700"
                        : "text-muted-foreground"
                  )}
                >
                  {hoursProgress}%
                </span>
              </div>
            </Progress>
            <div className="min-w-0">
              <div
                className={cn(
                  "text-[10px]",
                  scheduleStatus === "over"
                    ? "text-rose-700"
                    : scheduleStatus === "balanced"
                      ? "text-emerald-700"
                      : "text-muted-foreground"
                )}
              >
                {scheduleStatus === "over"
                  ? "Over weekly target"
                  : scheduleStatus === "balanced"
                    ? "On track for target hours"
                    : "Below target hours"}
              </div>
            </div>
          </div>
        )}
      </div>
      <EmployeeRotaNotesDialog
        employee={employee}
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
      />
    </>
  )
}

function EmployeeRotaNotesTrigger({
  employee,
  layout,
}: {
  employee: WorkspaceEmployee
  layout: EmployeeCardProps["layout"]
}) {
  const rotaNotes = employee.rotaNotes ?? []

  if (rotaNotes.length === 0) {
    return null
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <button
            type="button"
            className={cn(
              "pointer-events-none absolute z-10 flex shrink-0 items-center justify-center rounded-md text-[#0069ff] opacity-0 transition-opacity hover:bg-[#eef3ff] focus-visible:ring-2 focus-visible:ring-[#0069ff] focus-visible:outline-hidden group-hover/card:pointer-events-auto group-hover/card:opacity-100 group-focus-within/card:pointer-events-auto group-focus-within/card:opacity-100",
              layout === "compact"
                ? "top-1/2 right-1 size-5 -translate-y-1/2"
                : "top-1.5 right-1.5 size-6"
            )}
            aria-label={`Show rota notes for ${employee.name}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <StickyNoteIcon
              className={cn(layout === "compact" ? "size-3.5" : "size-4")}
            />
          </button>
        }
      />
      <HoverCardContent align="end" side="right" className="w-80 p-3">
        <EmployeeRotaNotesContent employee={employee} />
      </HoverCardContent>
    </HoverCard>
  )
}

function EmployeeRotaNotesDialog({
  employee,
  open,
  onOpenChange,
}: {
  employee: WorkspaceEmployee
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if ((employee.rotaNotes ?? []).length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>Rota notes</DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-4">
          <EmployeeRotaNotesContent employee={employee} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EmployeeRotaNotesContent({
  employee,
}: {
  employee: WorkspaceEmployee
}) {
  const rotaNotes = employee.rotaNotes ?? []

  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-extrabold text-[#11245a]">
          {employee.name}
        </p>
        <Badge variant="secondary">
          {rotaNotes.length} note
          {rotaNotes.length === 1 ? "" : "s"}
        </Badge>
      </div>
      <div className="space-y-2">
        {rotaNotes.map((note) => (
          <article
            key={note.id}
            className="rounded-lg border border-[#edf0f6] bg-white p-2.5"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="min-w-0 flex-1 truncate text-xs font-extrabold text-[#11245a]">
                {note.title}
              </p>
              {note.isPinned ? (
                <PinIcon className="size-3 text-[#0069ff]" />
              ) : null}
              {note.priority === "high" ? (
                <Badge variant="destructive">
                  {employeeRotaNotePriorityLabels[note.priority]}
                </Badge>
              ) : null}
              <Badge variant="outline">
                {employeeRotaNoteCategoryLabels[note.category]}
              </Badge>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-xs font-medium text-[#33477d]">
              {note.body}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold text-[#61709a]">
              {getNoteScopeLabel(note)}
            </p>
          </article>
        ))}
      </div>
    </>
  )
}

function getNoteScopeLabel(
  note: NonNullable<WorkspaceEmployee["rotaNotes"]>[number]
) {
  if (note.zoneName && note.locationName) {
    return `${note.locationName} - ${note.zoneName}`
  }

  if (note.zoneName) {
    return note.zoneName
  }

  if (note.locationName) {
    return note.locationName
  }

  return "All locations"
}

export type { EmployeeCardProps }
export default EmployeeCard
