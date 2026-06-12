"use client"

import * as React from "react"
import { PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

function RenameRotaTemplateDialog({
  defaultName,
  pending = false,
  onSubmit,
}: {
  defaultName: string
  pending?: boolean
  onSubmit: (values: { name: string }) => Promise<void>
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(defaultName)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setName(defaultName)
      setError(null)
    }
  }, [defaultName, open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedName = name.trim()

    if (!normalizedName) {
      setError("Enter a template name.")
      return
    }

    try {
      await onSubmit({ name: normalizedName })
      setOpen(false)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not rename that template.",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" variant="pill" size="sm" className="gap-2" />}
      >
        <PencilIcon className="size-3.5" />
        Rename
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename template</DialogTitle>
          <DialogDescription>
            Update the name managers see when choosing rota templates.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <Field>
            <FieldLabel htmlFor="template-name">Template name</FieldLabel>
            <FieldContent>
              <Input
                id="template-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Weekend rota"
                maxLength={80}
                autoFocus
              />
              <FieldError>{error}</FieldError>
            </FieldContent>
          </Field>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { RenameRotaTemplateDialog }
