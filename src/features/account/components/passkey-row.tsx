"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PencilIcon, Trash2Icon } from "lucide-react"
import * as React from "react"
import type { Passkey } from "@better-auth/passkey"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { passkeyQueryKey } from "@/features/account/queries/passkey-queries"
import { authClient } from "@/lib/auth-client"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function PasskeyRow({ passkey }: { passkey: Passkey }) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = React.useState(false)
  const [name, setName] = React.useState(passkey.name || "Saved sign-in")
  const updateMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.passkey.updatePasskey({
        id: passkey.id,
        name: name.trim(),
      })
      if (result.error) throw new Error(result.error.message)
    },
    onSuccess: async () => {
      setIsEditing(false)
      await queryClient.invalidateQueries({ queryKey: passkeyQueryKey })
      showSuccessToast("Saved sign-in renamed.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not rename this saved sign-in.",
      })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.passkey.deletePasskey({ id: passkey.id })
      if (result.error) throw new Error(result.error.message)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: passkeyQueryKey })
      showSuccessToast("Saved sign-in removed.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not remove this saved sign-in.",
      })
    },
  })

  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <Input
            value={name}
            maxLength={80}
            aria-label="Rename saved sign-in"
            onChange={(event) => setName(event.target.value)}
          />
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">
              {passkey.name || "Saved sign-in"}
            </p>
            {passkey.backedUp ? <Badge variant="outline">Backed up</Badge> : null}
          </div>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Added {new Date(passkey.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button
              type="button"
              disabled={!name.trim() || updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <PencilIcon />
            Rename
          </Button>
        )}
        <PasskeyDeleteDialog
          isDeleting={deleteMutation.isPending}
          onDelete={() => deleteMutation.mutate()}
        />
      </div>
    </div>
  )
}

function PasskeyDeleteDialog({
  isDeleting,
  onDelete,
}: {
  isDeleting: boolean
  onDelete: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button type="button" variant="destructive" size="icon">
            <Trash2Icon />
            <span className="sr-only">Remove saved sign-in</span>
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove this saved sign-in?</AlertDialogTitle>
          <AlertDialogDescription>
            You will no longer be able to use this passkey to sign in, including
            on devices where it is synced. You can still use your password or
            another saved sign-in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={onDelete}
          >
            {isDeleting ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { PasskeyRow }
