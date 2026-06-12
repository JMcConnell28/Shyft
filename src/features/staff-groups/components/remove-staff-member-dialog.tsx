"use client"

import type { StaffGroupSettingsEmployee } from "@/features/staff-groups/types"
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

function RemoveStaffMemberDialog({
  employee,
  pending,
  scopeLabel,
  onClose,
  onConfirm,
}: {
  employee: StaffGroupSettingsEmployee | null
  pending: boolean
  scopeLabel: "location" | "organisation"
  onClose: () => void
  onConfirm: (employeeId: string) => Promise<void>
}) {
  return (
    <AlertDialog
      open={employee !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove {employee?.name ?? "this team member"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            They will be removed from this {scopeLabel}, deactivated for rota
            planning, and kept on existing rotas for historical records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending || !employee}
            onClick={() => {
              if (!employee) return
              void onConfirm(employee.id).finally(onClose)
            }}
          >
            {pending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { RemoveStaffMemberDialog }
