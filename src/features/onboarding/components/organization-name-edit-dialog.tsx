"use client"

import { useForm, useStore } from "@tanstack/react-form"
import { useId, useRef, useState } from "react"

import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { organizationNameSchema } from "@/features/onboarding/schemas/onboarding-schemas"
import { getErrorMessage } from "@/lib/errors"
import { getFieldError } from "@/lib/forms"
import { createZodFieldValidator } from "@/lib/validation"

function OrganizationNameEditDialog({
  name,
  disabled,
  onSave,
}: {
  name: string
  disabled?: boolean
  onSave: (name: string) => Promise<void>
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: { name },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await onSave(organizationNameSchema.parse(value.name))
        setOpen(false)
      } catch (cause) {
        setError(
          getErrorMessage(cause, "We could not save your organisation name.")
        )
      }
    },
  })
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (isSubmitting) {
          details.cancel()
          return
        }
        if (nextOpen) {
          form.reset({ name })
          setError(null)
        }
        setOpen(nextOpen)
      }}
    >
      <DialogTrigger
        render={<Button type="button" variant="link" />}
        aria-label="Edit organisation name"
        className="min-h-11 shrink-0 px-1 text-sm font-semibold text-[#075fe6] underline"
        disabled={disabled}
      >
        Edit
      </DialogTrigger>
      <DialogContent initialFocus={inputRef} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Edit organisation name</DialogTitle>
          <DialogDescription>
            Your workspace setup will stay on this step.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="name"
            validators={{
              onSubmit: createZodFieldValidator(organizationNameSchema),
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={inputId}>Organisation name</FieldLabel>
                <Input
                  ref={inputRef}
                  id={inputId}
                  name={field.name}
                  value={field.state.value}
                  disabled={isSubmitting}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldError>{getFieldError(field)}</FieldError>
              </Field>
            )}
          </form.Field>
          {error ? (
            <div role="alert">
              <FormErrorMessage message={error} />
            </div>
          ) : null}
          <div className="flex justify-end gap-2">
            <DialogClose
              render={<Button type="button" variant="outline" size="lg" />}
              disabled={isSubmitting}
            >
              Cancel
            </DialogClose>
            <FormSubmitButton
              isSubmitting={isSubmitting}
              submittingText="Saving…"
            >
              Save name
            </FormSubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { OrganizationNameEditDialog }
