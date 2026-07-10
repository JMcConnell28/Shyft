"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ConnectionConfirmDialogProps = {
  confirmLabel: string
  description: string
  isOpen: boolean
  isPending?: boolean
  onConfirm: () => void
  onOpenChange: (isOpen: boolean) => void
  title: string
}

function ConnectionConfirmDialog({
  confirmLabel,
  description,
  isOpen,
  isPending = false,
  onConfirm,
  onOpenChange,
  title,
}: ConnectionConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="-m-4 mt-0">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isPending} onClick={onConfirm}>
            {isPending ? "Saving..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConnectionConfirmDialog }
