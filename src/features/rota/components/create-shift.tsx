"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { Plus } from "lucide-react"

import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { CreateShiftDayField } from "@/features/rota/components/create-shift-day-field"
import { CreateShiftTimeField } from "@/features/rota/components/create-shift-time-field"
import { CreateShiftZoneField } from "@/features/rota/components/create-shift-zone-field"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import {
  createShiftSchema,
  type CreateShiftSchema,
} from "@/features/rota/schemas/create-shift-schema"
import { getErrorMessage } from "@/lib/errors"
import { showSuccessToast } from "@/lib/toast"
import { createZodFieldValidator } from "@/lib/validation"

function CreateShift() {
  const { createShift, days, zones } = useRotaWorkspace()
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm({
    defaultValues: getDefaultValues(),
    onSubmit: async ({ value }) => {
      setError(null)

      try {
        const input = createShiftSchema.parse(value)
        createShift(input)
        showSuccessToast("Shift added to the rota.")
        setOpen(false)
        form.reset(getDefaultValues())
      } catch (submissionError) {
        setError(getErrorMessage(submissionError, "We could not create that shift."))
      }
    },
  })

  React.useEffect(() => {
    if (!open) {
      form.reset(getDefaultValues())
      setError(null)
    }
  }, [form, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white"
          />
        }
      >
        <Plus data-icon="inline-start" />
        New shift
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create shift</DialogTitle>
          <DialogDescription>
            Choose a day, zone, and times for the new shift.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="dayId"
              validators={{
                onSubmit: createZodFieldValidator(createShiftSchema.shape.dayId),
              }}
            >
              {(field) => <CreateShiftDayField field={field} days={days} />}
            </form.Field>

            <form.Field
              name="zoneId"
              validators={{
                onSubmit: createZodFieldValidator(createShiftSchema.shape.zoneId),
              }}
            >
              {(field) => <CreateShiftZoneField field={field} zones={zones} />}
            </form.Field>

            <div className="grid grid-cols-2 gap-3">
              <form.Field
                name="startTime"
                validators={{
                  onSubmit: createZodFieldValidator(createShiftSchema.shape.startTime),
                }}
              >
                {(field) => <CreateShiftTimeField field={field} label="Start" />}
              </form.Field>
              <form.Field
                name="endTime"
                validators={{
                  onSubmit: createZodFieldValidator(createShiftSchema.shape.endTime),
                }}
              >
                {(field) => <CreateShiftTimeField field={field} label="Finish" />}
              </form.Field>
            </div>
          </FieldGroup>

          <FormErrorMessage message={error} />

          <DialogFooter className="px-0 pt-4">
            <DialogClose render={<Button type="button" variant="outline" size="lg" />}>
              Cancel
            </DialogClose>
            <FormSubmitButton isSubmitting={form.state.isSubmitting}>
              Add shift
            </FormSubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getDefaultValues(): CreateShiftSchema {
  return {
    dayId: "",
    zoneId: "",
    startTime: "09:00",
    endTime: "17:00",
  }
}

export default CreateShift
