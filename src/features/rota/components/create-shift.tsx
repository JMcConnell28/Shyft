"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { Plus } from "lucide-react"

import { FormErrorMessage } from "@/components/forms/form-error-message"
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
import { Switch } from "@/components/ui/switch"
import { CreateShiftDayField } from "@/features/rota/components/create-shift-day-field"
import { CreateShiftTimeField } from "@/features/rota/components/create-shift-time-field"
import { CreateShiftTypeField } from "@/features/rota/components/create-shift-type-field"
import { CreateShiftZoneField } from "@/features/rota/components/create-shift-zone-field"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"
import {
  createShiftFormSchema,
  parseCreateShiftInput,
  type CreateShiftFormSchema,
} from "@/features/rota/schemas/create-shift-schema"
import { getErrorMessage } from "@/lib/errors"
import { showSuccessToast } from "@/lib/toast"
import { createZodFieldValidator } from "@/lib/validation"

function CreateShift() {
  const { createShift, days, locations, selectedLocationId, zones } =
    useRotaWorkspace()
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) ?? null

  const form = useForm({
    defaultValues: getDefaultValues(),
    onSubmit: async ({ value }) => {
      setError(null)

      try {
        const input = parseCreateShiftInput(value, {
          days,
          location: selectedLocation,
        })
        await createShift(input)
        showSuccessToast("Shift added to the rota.")
        setOpen(false)
        form.reset(getDefaultValues())
      } catch (submissionError) {
        setError(
          getErrorMessage(submissionError, "We could not create that shift.")
        )
      }
    },
  })

  React.useEffect(() => {
    if (!open) {
      form.reset(getDefaultValues())
      setError(null)
    }
  }, [form, open])

  function applyShiftTypeDefaults(
    nextShiftType: CreateShiftFormSchema["shiftType"]
  ) {
    form.setFieldValue("shiftType", () => nextShiftType)
    form.setFieldValue("useCloseTime", () => false)

    if (nextShiftType === "standard") {
      form.setFieldValue("startTime", () => "09:00")
      form.setFieldValue("endTime", () => "17:00")
      return
    }

    form.setFieldValue("splitStartTime", () => "10:00")
    form.setFieldValue("splitEndTime", () => "14:00")
    form.setFieldValue("splitSecondStartTime", () => "17:00")
    form.setFieldValue("splitSecondEndTime", () => "21:00")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="raised"
            size="icon"
            aria-label="Create shift"
            className="border-emerald-700 bg-emerald-600 hover:bg-emerald-700 focus-visible:border-emerald-800 focus-visible:ring-emerald-500/30 md:h-7 md:w-auto md:gap-2 md:px-2"
          />
        }
      >
        <Plus data-icon="inline-start" />
        <span className="hidden md:inline">New shift</span>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle>Create shift</DialogTitle>
          <DialogDescription>
            Choose a day, zone, and shift details for the new rota slot.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-0"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup className="gap-4 px-5 pb-5">
            <form.Field name="shiftType">
              {(field) => (
                <CreateShiftTypeField
                  field={field}
                  onValueChange={(nextValue) => {
                    applyShiftTypeDefaults(nextValue)
                  }}
                />
              )}
            </form.Field>

            <form.Field
              name="dayId"
              validators={{
                onSubmit: createZodFieldValidator(
                  createShiftFormSchema.shape.dayId
                ),
              }}
            >
              {(field) => <CreateShiftDayField field={field} days={days} />}
            </form.Field>

            <form.Field
              name="zoneId"
              validators={{
                onSubmit: createZodFieldValidator(
                  createShiftFormSchema.shape.zoneId
                ),
              }}
            >
              {(field) => <CreateShiftZoneField field={field} zones={zones} />}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.shiftType}>
              {(shiftType) =>
                shiftType === "standard" ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="startTime"
                        validators={{
                          onSubmit: createZodFieldValidator(
                            createShiftFormSchema.shape.startTime
                          ),
                        }}
                      >
                        {(field) => (
                          <CreateShiftTimeField field={field} label="Start" />
                        )}
                      </form.Field>
                      <form.Subscribe
                        selector={(state) => state.values.useCloseTime}
                      >
                        {(useCloseTime) => (
                          <form.Field
                            name="endTime"
                            validators={{
                              onSubmit: createZodFieldValidator(
                                createShiftFormSchema.shape.endTime
                              ),
                            }}
                          >
                            {(field) => (
                              <CreateShiftTimeField
                                field={field}
                                label="Finish"
                                disabled={useCloseTime}
                              />
                            )}
                          </form.Field>
                        )}
                      </form.Subscribe>
                    </div>
                    <form.Field name="useCloseTime">
                      {(closeField) => (
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/15 px-3 py-2">
                          <span className="text-sm font-medium text-foreground">
                            Use location closing time
                          </span>
                          <Switch
                            checked={Boolean(closeField.state.value)}
                            onCheckedChange={(checked) => {
                              closeField.handleChange(Boolean(checked))
                            }}
                          />
                        </label>
                      )}
                    </form.Field>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="splitStartTime"
                        validators={{
                          onSubmit: createZodFieldValidator(
                            createShiftFormSchema.shape.splitStartTime
                          ),
                        }}
                      >
                        {(field) => (
                          <CreateShiftTimeField
                            field={field}
                            label="Shift 1 start"
                          />
                        )}
                      </form.Field>
                      <form.Field
                        name="splitEndTime"
                        validators={{
                          onSubmit: createZodFieldValidator(
                            createShiftFormSchema.shape.splitEndTime
                          ),
                        }}
                      >
                        {(field) => (
                          <CreateShiftTimeField
                            field={field}
                            label="Shift 1 finish"
                          />
                        )}
                      </form.Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="splitSecondStartTime"
                        validators={{
                          onSubmit: createZodFieldValidator(
                            createShiftFormSchema.shape.splitSecondStartTime
                          ),
                        }}
                      >
                        {(field) => (
                          <CreateShiftTimeField
                            field={field}
                            label="Shift 2 start"
                          />
                        )}
                      </form.Field>
                      <form.Field
                        name="splitSecondEndTime"
                        validators={{
                          onSubmit: createZodFieldValidator(
                            createShiftFormSchema.shape.splitSecondEndTime
                          ),
                        }}
                      >
                        {(field) => (
                          <form.Subscribe
                            selector={(state) => state.values.useCloseTime}
                          >
                            {(useCloseTime) => (
                              <CreateShiftTimeField
                                field={field}
                                label="Shift 2 finish"
                                disabled={useCloseTime}
                              />
                            )}
                          </form.Subscribe>
                        )}
                      </form.Field>
                    </div>
                    <form.Field name="useCloseTime">
                      {(closeField) => (
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/70 bg-background px-3 py-2">
                          <span className="text-sm font-medium text-foreground">
                            Shift 2 finishes at close
                          </span>
                          <Switch
                            checked={Boolean(closeField.state.value)}
                            onCheckedChange={(checked) => {
                              closeField.handleChange(Boolean(checked))
                            }}
                          />
                        </label>
                      )}
                    </form.Field>
                  </div>
                )
              }
            </form.Subscribe>
          </FieldGroup>

          <div className="px-5">
            <FormErrorMessage message={error} />
          </div>

          <DialogFooter className="flex-row justify-end gap-2 border-t border-border/70 bg-background py-3">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={form.state.isSubmitting}>
              Add shift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getDefaultValues(): CreateShiftFormSchema {
  return {
    dayId: "",
    zoneId: "",
    shiftType: "standard",
    useCloseTime: false,
    startTime: "09:00",
    endTime: "17:00",
    splitStartTime: "10:00",
    splitEndTime: "14:00",
    splitSecondStartTime: "17:00",
    splitSecondEndTime: "21:00",
  }
}

export default CreateShift
