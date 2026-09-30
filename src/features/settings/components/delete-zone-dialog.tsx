"use client"

import * as React from "react"
import { ArchiveIcon } from "lucide-react"

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
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleConfirm() {
    try {
      setError(null)
      await onConfirm()
      setOpen(false)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We could not archive this zone."
      )
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        disabled={disabled}
        render={
          <Button type="button" variant="pill" size="sm" className="gap-2" />
        }
      >
        <ArchiveIcon className="size-3.5" />
        Archive
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {zoneName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the zone from future planning. Existing shifts and past
            rotas will keep showing the zone name they were saved with.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
          >
            {pending ? "Archiving..." : "Archive zone"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { DeleteZoneDialog }
