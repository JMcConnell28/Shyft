"use client"

import { Trash2Icon } from "lucide-react"

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

function DeleteZoneDialog({
  disabled = false,
  pending = false,
  zoneName,
  onConfirm,
}: {
  disabled?: boolean
  pending?: boolean
  zoneName: string
  onConfirm: () => Promise<void>
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={disabled}
        render={
          <Button type="button" variant="pill" size="sm" className="gap-2" />
        }
      >
        <Trash2Icon className="size-3.5" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {zoneName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the zone from this location. Saved rotas that still use it
            will block deletion until those shifts are moved or removed.
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
            {pending ? "Deleting..." : "Delete zone"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { DeleteZoneDialog }
