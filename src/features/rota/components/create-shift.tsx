"use client"

import * as React from "react"
import { LoaderCircle, Plus } from "lucide-react"
import { toast } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { rotaToolbarPrimaryButtonClassName } from "@/features/rota/constants/rota-toolbar-styles"

const loadCreateShiftDialog = () =>
  import("@/features/rota/components/create-shift-dialog")
const CreateShiftDialog = React.lazy(loadCreateShiftDialog)

function CreateShift() {
  const [open, setOpen] = React.useState(false)
  const [isOpening, setIsOpening] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  async function openDialog() {
    if (open || isOpening) return
    setIsOpening(true)

    try {
      await loadCreateShiftDialog()
      setOpen(true)
    } catch {
      toast.error("We could not open the new shift form. Please try again.")
    } finally {
      setIsOpening(false)
    }
  }

  function closeDialog() {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="raised"
        className={`${rotaToolbarPrimaryButtonClassName} w-auto gap-1.5 px-2`}
        disabled={isOpening}
        onClick={() => void openDialog()}
        onPointerEnter={() => {
          void loadCreateShiftDialog().catch(() => undefined)
        }}
        onFocus={() => {
          void loadCreateShiftDialog().catch(() => undefined)
        }}
      >
        {isOpening ? (
          <LoaderCircle data-icon="inline-start" className="animate-spin" />
        ) : (
          <Plus data-icon="inline-start" />
        )}
        {isOpening ? "Opening..." : "New shift"}
      </Button>
      <React.Suspense fallback={null}>
        {open ? <CreateShiftDialog onClose={closeDialog} /> : null}
      </React.Suspense>
    </>
  )
}

export default CreateShift
