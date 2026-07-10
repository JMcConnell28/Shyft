"use client"
import { useBlocker } from "@tanstack/react-router"
import { LoaderCircleIcon, TriangleAlertIcon } from "lucide-react"

import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import { useSaveRotaWorkspace } from "@/features/rota/hooks/use-save-rota-workspace"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function RotaNavigationBlocker() {
  const { hasUnsavedChanges } = useRotaWorkspace()
  const { isSaving, save } = useSaveRotaWorkspace()
  const blocker = useBlocker({
    shouldBlockFn: () => hasUnsavedChanges,
    enableBeforeUnload: hasUnsavedChanges,
    withResolver: true,
  })
  const isBlocked = blocker.status === "blocked"

  async function handleSaveAndLeave() {
    if (!isBlocked || isSaving) {
      return
    }

    try {
      await save({
        bypassRateLimit: true,
      })
      blocker.proceed()
    } catch {
      blocker.reset()
    }
  }

  function handleDiscard() {
    if (!isBlocked || isSaving) {
      return
    }

    blocker.proceed()
  }

  function handleCancel() {
    if (!isBlocked || isSaving) {
      return
    }

    blocker.reset()
  }

  return (
    <AlertDialog
      open={isBlocked}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlertIcon className="size-4" />
          </AlertDialogMedia>
          <AlertDialogTitle>Leave this rota with unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have changes that have not been saved yet. You can discard them,
            save them before leaving, or stay on this rota.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving} onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isSaving}
            onClick={handleDiscard}
          >
            Discard
          </AlertDialogAction>
          <AlertDialogAction disabled={isSaving} onClick={handleSaveAndLeave}>
            {isSaving ? (
              <>
                <LoaderCircleIcon className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default RotaNavigationBlocker
