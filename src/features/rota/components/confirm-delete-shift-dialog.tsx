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

function ConfirmDeleteShiftDialog({
  assignmentCount,
  onClose,
  onConfirm,
}: {
  assignmentCount: number
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete shift?</AlertDialogTitle>
          <AlertDialogDescription>
            {assignmentCount > 0
              ? `This will remove the shift and unassign ${assignmentCount} team member${assignmentCount === 1 ? "" : "s"} from it.`
              : "This shift will be removed from the rota."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete shift
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmDeleteShiftDialog
