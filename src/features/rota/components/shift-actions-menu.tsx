import * as React from "react"
import { Ellipsis, Trash2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { useDeleteShift } from "@/features/rota/hooks/use-delete-shift"

const AssignShiftDialog = React.lazy(() => import("./assign-shift-dialog"))
const ConfirmDeleteShiftDialog = React.lazy(
  () => import("./confirm-delete-shift-dialog")
)

function ShiftActionsMenu({
  shiftId,
  shiftLabel,
  assignmentCount,
}: {
  shiftId: string
  shiftLabel: string
  assignmentCount: number
}) {
  const { meta } = useRotaWorkspace()
  const { removeShift } = useDeleteShift()
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [assignOpen, setAssignOpen] = React.useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false)

  function handleDelete() {
    setMenuOpen(false)
    if (!meta.settings.confirmShiftDelete && assignmentCount === 0) {
      void removeShift(shiftId)
    } else {
      setConfirmDeleteOpen(true)
    }
  }

  if (!meta.canEdit) return null

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              ref={buttonRef}
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-7 shrink-0 rounded-sm"
              aria-label={`Shift options: ${shiftLabel}`}
            />
          }
        >
          <Ellipsis className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40"
          finalFocus={assignOpen || confirmDeleteOpen ? false : buttonRef}
        >
          <DropdownMenuItem
            onClick={() => {
              setMenuOpen(false)
              setAssignOpen(true)
            }}
          >
            <UserPlus />
            Assign employee
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 />
            Delete shift
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <React.Suspense fallback={null}>
        {assignOpen ? (
          <AssignShiftDialog
            shiftId={shiftId}
            shiftLabel={shiftLabel}
            returnFocusRef={buttonRef}
            onClose={() => setAssignOpen(false)}
          />
        ) : null}
        {confirmDeleteOpen ? (
          <ConfirmDeleteShiftDialog
            assignmentCount={assignmentCount}
            onClose={() => setConfirmDeleteOpen(false)}
            onConfirm={() => {
              setConfirmDeleteOpen(false)
              void removeShift(shiftId)
            }}
          />
        ) : null}
      </React.Suspense>
    </>
  )
}

export { ShiftActionsMenu }
