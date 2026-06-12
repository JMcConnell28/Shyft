"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { Ellipsis, Trash2 } from "lucide-react"

import AssignedEmployeeName from "@/features/rota/components/assigned-employee-name"
import DraggableAssignedEmployeeName from "@/features/rota/components/draggable-assigned-employee-name"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { useDeleteShift } from "@/features/rota/hooks/use-delete-shift"
import { getShiftDisplayLines } from "@/features/rota/utils/workspace-shifts"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

function Shift({
  shiftId,
  readOnly = false,
}: {
  shiftId: string
  readOnly?: boolean
}) {
  const {
    assignmentIdsByShiftId,
    assignmentsById,
    getEmployee,
    shiftsById,
    zones,
  } = useRotaWorkspace()
  const { removeShift } = useDeleteShift()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)
  const isTouchInput = useIsTouchInput()
  const shift = shiftsById[shiftId]
  const assignmentIds = assignmentIdsByShiftId[shiftId] ?? []
  const droppable = useDroppable({
    id: shiftId,
    data: {
      type: "shift",
      shiftId,
    },
    disabled: readOnly,
  })

  if (!shift) {
    return null
  }

  const zone = zones.find((entry) => entry.id === shift.zoneId)
  const zoneLabel = zone?.name ?? shift.zoneName ?? "Shift"
  const timeLines = getShiftDisplayLines(shift)
  function handleDeleteAction() {
    setMenuOpen(false)

    if (assignmentIds.length === 0) {
      void removeShift(shiftId)
      return
    }

    setConfirmDeleteOpen(true)
  }

  const shiftCard = (
    <div
      className={cn(
        "rounded-md border border-border/70 bg-background px-2 py-1.5 shadow-sm transition-colors",
        !readOnly && droppable.isOver
          ? "border-primary bg-primary/5"
          : undefined,
        !readOnly && isTouchInput ? "cursor-pointer" : undefined
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex w-full items-center justify-between">
          <div
            className={cn(
              "min-w-0 text-[11px] font-semibold text-foreground",
              timeLines.length > 1 ? "space-y-0.5" : "truncate"
            )}
          >
            {timeLines.map((line) => (
              <p key={line} className="truncate">
                {line}
              </p>
            ))}
          </div>
          {readOnly ? (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {zoneLabel}
            </p>
          ) : isTouchInput ? (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {zoneLabel}
            </p>
          ) : (
            <div className="relative ml-2 flex min-w-0 items-center justify-end">
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground transition-opacity group-focus-within/shift:opacity-0 group-hover/shift:opacity-0">
                {zoneLabel}
              </p>
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 rounded-md opacity-0 transition-opacity group-focus-within/shift:pointer-events-auto group-focus-within/shift:opacity-100 group-hover/shift:pointer-events-auto group-hover/shift:opacity-100"
                    />
                  }
                >
                  <Ellipsis />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleDeleteAction}
                  >
                    <Trash2 />
                    Delete shift
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div
        ref={readOnly ? undefined : droppable.setNodeRef}
        className="space-y-1"
      >
        {readOnly ? (
          shiftCard
        ) : isTouchInput ? (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="block w-full text-left outline-none"
                />
              }
            >
              {shiftCard}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDeleteAction}
              >
                <Trash2 />
                Delete shift
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="group/shift">{shiftCard}</div>
        )}

        <div className="mb-3 flex w-full flex-col items-center space-y-0.5">
          {assignmentIds.length === 0 ? (
            <p className="px-1 text-[10px] text-muted-foreground">
              No one assigned yet
            </p>
          ) : (
            assignmentIds.map((assignmentId) => {
              const assignment = assignmentsById[assignmentId]
              const employee = assignment
                ? getEmployee(assignment.employeeId)
                : undefined

              if (!assignment || !employee) {
                return null
              }

              return readOnly ? (
                <AssignedEmployeeName key={assignment.id} employee={employee} />
              ) : (
                <DraggableAssignedEmployeeName
                  key={assignment.id}
                  employee={employee}
                  dragId={`assignment-${assignment.id}`}
                  dragData={{
                    type: "assignment",
                    assignmentId: assignment.id,
                    employeeId: assignment.employeeId,
                  }}
                />
              )
            })
          )}
        </div>
      </div>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete shift?</AlertDialogTitle>
            <AlertDialogDescription>
              {assignmentIds.length > 0
                ? `This will remove the shift and unassign ${assignmentIds.length} team member${assignmentIds.length === 1 ? "" : "s"} from it.`
                : "This shift will be removed from the rota."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmDeleteOpen(false)
                void removeShift(shiftId)
              }}
            >
              Delete shift
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function useIsTouchInput() {
  const [isTouchInput, setIsTouchInput] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)")
    const updateMatch = () => {
      setIsTouchInput(mediaQuery.matches)
    }

    updateMatch()

    mediaQuery.addEventListener("change", updateMatch)

    return () => {
      mediaQuery.removeEventListener("change", updateMatch)
    }
  }, [])

  return isTouchInput
}

export default Shift
