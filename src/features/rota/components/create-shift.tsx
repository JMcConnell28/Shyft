"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { Plus } from "lucide-react"

import type { CreateShiftFormSchema } from "@/features/rota/schemas/create-shift-schema"
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
import { rotaToolbarPrimaryButtonClassName } from "@/features/rota/constants/rota-toolbar-styles"
// eslint-disable-next-line no-duplicate-imports
import {
  createShiftFormSchema,
  parseCreateShiftInput,
} from "@/features/rota/schemas/create-shift-schema"
import { getErrorMessage } from "@/lib/errors"
import { showSuccessToast } from "@/lib/toast"
import { createZodFieldValidator } from "@/lib/validation"

function CreateShift() {
  const { createShift, days, locations, selectedLocationId, zones } =
    useRotaWorkspace()
  const activeZones = React.useMemo(
    () => zones.filter((zone) => !zone.isDeleted),
    [zones]
  )
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isCreatingShift, setIsCreatingShift] = React.useState(false)
  const selectedLocation =
    locations.find((location) => location.id === selectedLocationId) ?? null

  const form = useForm({
    defaultValues: getDefaultValues({ days, zones: activeZones }),
    onSubmit: async ({ value }) => {
      if (isCreatingShift) {
        return
      }

      setError(null)
      setIsCreatingShift(true)

      try {
        const input = parseCreateShiftInput(value, {
          days,
          location: selectedLocation,
        })
        await createShift(input)
        showSuccessToast("Shift added to the rota.")
        setOpen(false)
        form.reset(getDefaultValues({ days, zones: activeZones }))
      } catch (submissionError) {
        setError(
          getErrorMessage(submissionError, "We could not create that shift.")
        )
      } finally {
        setIsCreatingShift(false)
      }
    },
  })

  React.useEffect(() => {
    if (!open) {
      form.reset(getDefaultValues({ days, zones: activeZones }))
      setError(null)
    }
  }, [activeZones, days, form, open])

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      form.reset(getDefaultValues({ days, zones: activeZones }))
    }

    setError(null)
    setIsCreatingShift(false)
    setOpen(nextOpen)
  }

  function applyShiftTypeDefaults(
    nextShiftType: CreateShiftFormSchema["shiftType"]
  ) {
    form.setFieldValue("shiftType", () => nextShiftType)
    form.setFieldValue("useCloseTime", false)

    if (nextShiftType === "standard") {
      form.setFieldValue("startTime", "09:00")
      form.setFieldValue("endTime", "17:00")
      return
    }

    form.setFieldValue("splitStartTime", "09:00")
    form.setFieldValue("splitEndTime", "13:00")
    form.setFieldValue("splitSecondStartTime", "17:00")
    form.setFieldValue("splitSecondEndTime", "21:00")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="raised"
            className={`${rotaToolbarPrimaryButtonClassName} w-auto gap-1.5 px-2`}
          />
        }
      >
        <Plus data-icon="inline-start" />
        New shift
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100svh-2rem)] max-w-[34rem] overflow-y-auto rounded-2xl bg-white p-0 shadow-[0_20px_60px_rgba(17,36,90,0.16)] ring-1 ring-[#e2e7f0]">
        <DialogHeader className="gap-1.5 px-4 pt-4 pb-1 sm:px-5 sm:pt-5">
          <DialogTitle className="text-2xl leading-none font-extrabold tracking-[-0.04em] text-[#11245a]">
            New shift
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-[#61709a]">
            Create a shift for your rota.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-0"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
          onChange={() => {
            if (error) {
              setError(null)
            }
          }}
        >
          <FieldGroup className="gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
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

            <div className="grid gap-3">
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
                {(field) => (
                  <CreateShiftZoneField field={field} zones={activeZones} />
                )}
              </form.Field>
            </div>

            <form.Subscribe selector={(state) => state.values.shiftType}>
              {(shiftType) =>
                shiftType === "standard" ? (
                  <div className="space-y-2.5">
                    <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
                      <form.Field name="useCloseTime">
                        {(closeField) => (
                          <label className="flex h-10 cursor-pointer items-center justify-between gap-2 rounded-lg px-1 sm:justify-start">
                            <span className="text-xs font-semibold text-[#4c5d8b]">
                              Till closing
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
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-[#e2e7f0] bg-white p-3 shadow-[0_6px_18px_rgba(30,50,96,0.035)]">
                      <div className="mb-2.5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold text-[#11245a]">
                            First shift
                          </p>
                          <p className="text-[11px] font-medium text-[#7a86a4]">
                            The opening segment.
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-2.5 sm:grid-cols-2">
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
                              label="Start time"
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
                              label="Finish time"
                            />
                          )}
                        </form.Field>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#e2e7f0] bg-white p-3 shadow-[0_6px_18px_rgba(30,50,96,0.035)]">
                      <div className="mb-2.5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold text-[#11245a]">
                            Second shift
                          </p>
                          <p className="text-[11px] font-medium text-[#7a86a4]">
                            Add the return segment after the break.
                          </p>
                        </div>
                        <span className="rounded-md bg-[#eef2f7] px-1.5 py-0.5 text-[10px] font-bold text-[#61709a]">
                          Split
                        </span>
                      </div>
                      <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
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
                              label="Start time"
                            />
                          )}
                        </form.Field>
                        <form.Subscribe
                          selector={(state) => state.values.useCloseTime}
                        >
                          {(useCloseTime) => (
                            <form.Field
                              name="splitSecondEndTime"
                              validators={{
                                onSubmit: createZodFieldValidator(
                                  createShiftFormSchema.shape.splitSecondEndTime
                                ),
                              }}
                            >
                              {(field) => (
                                <CreateShiftTimeField
                                  field={field}
                                  label="Finish time"
                                  disabled={useCloseTime}
                                />
                              )}
                            </form.Field>
                          )}
                        </form.Subscribe>
                        <form.Field name="useCloseTime">
                          {(closeField) => (
                            <label className="flex h-10 cursor-pointer items-center justify-between gap-2 rounded-lg px-1 sm:justify-start">
                              <span className="text-xs font-semibold text-[#4c5d8b]">
                                Till closing
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
                    </div>
                  </div>
                )
              }
            </form.Subscribe>
          </FieldGroup>

          <div className="px-4 sm:px-5">
            <FormErrorMessage message={error} />
          </div>

          <DialogFooter className="grid grid-cols-2 gap-2.5 border-0 bg-transparent px-4 pt-0 pb-4 sm:px-5 sm:pb-5">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="pill"
                  className="h-10 rounded-xl bg-white text-sm font-extrabold text-[#11245a] shadow-[0_6px_16px_rgba(30,50,96,0.07)] ring-1 ring-[#e2e7f0] hover:bg-[#f8faff] hover:text-[#11245a]"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isCreatingShift}
              className="h-10 rounded-xl bg-[#00a84f] text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(0,168,79,0.2)] hover:bg-[#009647]"
            >
              <Plus data-icon="inline-start" />
              Create shift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function getDefaultValues({
  days,
  zones,
}: {
  days: Array<{ id: string }>
  zones: Array<{ id: string }>
}): CreateShiftFormSchema {
  return {
    dayId: days[0]?.id ?? "",
    zoneId: zones.length === 1 ? zones[0].id : "",
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
