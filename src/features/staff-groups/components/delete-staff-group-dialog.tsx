"use client"

import { Trash2Icon } from "lucide-react"

import type { StaffGroupSettingsGroup } from "@/features/staff-groups/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

function DeleteStaffGroupDialog({
  group,
  pending = false,
  onConfirm,
}: {
  group: StaffGroupSettingsGroup
  pending?: boolean
  onConfirm: () => Promise<void>
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button type="button" variant="pill" size="sm" className="gap-2" />
        }
      >
        <Trash2Icon className="size-3.5" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {group.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {group.employeeCount > 0
              ? "Anyone in this group will be moved to the Employee group automatically."
              : "This removes the group from your organization settings."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() => {
              void onConfirm()
            }}
          >
            {pending ? "Deleting..." : "Delete group"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { DeleteStaffGroupDialog }
