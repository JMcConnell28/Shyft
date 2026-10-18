import { ArrowRightIcon, PlusCircleIcon } from "lucide-react"
import { useNewRotaForm } from "../hooks/use-new-rota-form"
import { NewRotaDialogShell } from "./new-rota-dialog-shell"
import { NewRotaFormFields } from "./new-rota-form-fields"
import type { NewRotaDialogContentProps } from "../types/new-rota-dialog"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"

function NewRotaDialogContent(props: NewRotaDialogContentProps) {
  const model = useNewRotaForm(props)
  const {
    form,
    error,
    previewErrorMessage,
    hasExistingRota,
    isSubmitting,
    isPreviewPending,
  } = model
  const PrimaryIcon = hasExistingRota ? ArrowRightIcon : PlusCircleIcon
  const primaryLabel = isSubmitting
    ? hasExistingRota
      ? "Opening..."
      : "Creating..."
    : hasExistingRota
      ? "Open existing rota"
      : "Create rota"
  return (
    <NewRotaDialogShell>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <div className="flex-1 space-y-3 overflow-y-auto px-6 pb-5 sm:px-7">
          <NewRotaFormFields model={model} />
          <FormErrorMessage message={error ?? previewErrorMessage} />
        </div>

        <div className="grid grid-cols-2 gap-2.5 bg-white px-6 pt-1 pb-6 sm:border-t sm:border-[#dfe5f0] sm:bg-[#fbfcff] sm:px-7 sm:py-4">
          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="default"
                className="h-11 rounded-xl border border-[#b9c6da] bg-white text-sm font-semibold text-[#0765e8] hover:bg-[#f7f9fc]"
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            type="submit"
            size="default"
            className="h-11 gap-2 rounded-xl bg-[#0868f7] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(8,104,247,0.2)] hover:bg-[#005de2]"
            disabled={isSubmitting || isPreviewPending}
          >
            <PrimaryIcon className="size-4" />
            {primaryLabel}
          </Button>
        </div>
      </form>
    </NewRotaDialogShell>
  )
}
export { NewRotaDialogContent }
