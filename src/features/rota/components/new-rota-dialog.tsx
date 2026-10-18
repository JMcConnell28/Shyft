"use client"

import { Suspense, lazy, useState } from "react"
import { FileStackIcon, PlusIcon } from "lucide-react"
import { rotaListPrimaryButtonClassName } from "../constants/rota-list-styles"
import { NewRotaDialogShell } from "./new-rota-dialog-shell"
import type { NewRotaDialogProps } from "../types/new-rota-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const NewRotaDialogContent = lazy(() =>
  import("./new-rota-dialog-content").then((module) => ({
    default: module.NewRotaDialogContent,
  }))
)

function NewRotaDialog({
  triggerLabel,
  triggerClassName,
  triggerIcon = "plus",
  disabled = false,
  ...options
}: NewRotaDialogProps) {
  const [state, setState] = useState<"idle" | "open" | "closed">("idle")
  const open = state === "open"
  const TriggerIcon = triggerIcon === "template" ? FileStackIcon : PlusIcon
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setState("open")
    else setState((current) => (current === "idle" ? current : "closed"))
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="base"
            className={cn(rotaListPrimaryButtonClassName, triggerClassName)}
          />
        }
      >
        <TriggerIcon className="size-4" />
        {triggerLabel}
      </DialogTrigger>
      {state !== "idle" ? (
        <Suspense
          fallback={
            <NewRotaDialogShell>
              <p
                role="status"
                className="px-6 pb-8 text-sm text-[#526991] sm:px-7"
              >
                Loading rota options…
              </p>
            </NewRotaDialogShell>
          }
        >
          <NewRotaDialogContent {...options} open={open} />
        </Suspense>
      ) : null}
    </Dialog>
  )
}
export { NewRotaDialog }
