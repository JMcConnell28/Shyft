"use client"

import * as React from "react"
import { addWeeks, parseISO } from "date-fns"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { CalendarDaysIcon, FileStackIcon, PlusIcon } from "lucide-react"

import type { AccessibleRotaLocation } from "@/features/rota/types"
import type { NewRotaSource } from "@/features/rota/schemas/rota-schemas"
import { NewRotaSourcePicker } from "@/features/rota/components/new-rota-source-picker"
import { NewRotaWeekListPicker } from "@/features/rota/components/new-rota-week-list-picker"
import { NewRotaWeekRowCalendar } from "@/features/rota/components/new-rota-week-row-calendar"
import { useCreateRotaDraftMutation } from "@/features/rota/hooks/use-create-rota-draft-mutation"
import { useRotaCreationPreviewQuery } from "@/features/rota/hooks/use-rota-creation-preview-query"
import { useRotaWeekPreviews } from "@/features/rota/hooks/use-rota-week-previews"
import {
  buildMonthWeekStarts,
  buildRollingWeekStarts,
  formatWeekRangeLabel,
} from "@/features/rota/utils/week-picker"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { Badge } from "@/components/ui/badge"
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getErrorMessage } from "@/lib/errors"
import { getFieldError } from "@/lib/forms"
import {
  createRotaDialogSchema,
  getWeekRangeFromStart,
  normalizeWeekStart,
} from "@/lib/rota-schemas"
import { cn } from "@/lib/utils"
import { createZodFieldValidator } from "@/lib/validation"

type NewRotaDialogProps = {
  locations: Array<AccessibleRotaLocation>
  selectedLocation: AccessibleRotaLocation | null
  triggerLabel: string
  triggerVariant?: "default" | "outline" | "pill" | "raised"
  triggerClassName?: string
  triggerIcon?: "plus" | "template"
  disabled?: boolean
  defaultSourceType?: NewRotaSource
  workspaceType?: "organization" | "location"
}

type PickerMode = "list" | "calendar"

function NewRotaDialog({
  locations,
  selectedLocation,
  triggerLabel,
  triggerVariant = "default",
  triggerClassName,
  triggerIcon = "plus",
  disabled = false,
  defaultSourceType = "blank",
  workspaceType = "organization",
}: NewRotaDialogProps) {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [pickerMode, setPickerMode] = React.useState<PickerMode>("list")
  const createRotaDraftMutation = useCreateRotaDraftMutation()
  const fallbackLocationId = selectedLocation?.id ?? locations.at(0)?.id ?? ""
  const currentWeekStart = React.useMemo(
    () => normalizeWeekStart(new Date()),
    []
  )
  const [calendarMonth, setCalendarMonth] = React.useState(() =>
    parseISO(`${currentWeekStart}T12:00:00`)
  )
  const autoAdvancedRef = React.useRef(false)

  const form = useForm({
    defaultValues: {
      locationId: fallbackLocationId,
      weekStart: currentWeekStart,
      sourceType: defaultSourceType,
      templateId: "",
    },
    onSubmit: async () => {
      setError(null)

      try {
        const result = await createRotaDraftMutation.mutateAsync({
          locationId: form.state.values.locationId,
          weekStart: form.state.values.weekStart,
          sourceType: form.state.values.sourceType,
          templateId: form.state.values.templateId || undefined,
        })

        await navigate({
          to:
            workspaceType === "location"
              ? "/w/$workspaceSlug/rota/$rotaId"
              : "/w/$workspaceSlug/rota/$locationSlug/$rotaId",
          params:
            workspaceType === "location"
              ? {
                  workspaceSlug: result.target.locationSlug,
                  rotaId: result.target.rotaId,
                }
              : {
                  workspaceSlug: result.target.orgSlug,
                  locationSlug: result.target.locationSlug,
                  rotaId: result.target.rotaId,
                },
        })
      } catch (submissionError) {
        setError(
          getErrorMessage(submissionError, "We could not create that rota.")
        )
      }
    },
  })

  const locationId = form.state.values.locationId
  const weekStart = form.state.values.weekStart
  const sourceType = form.state.values.sourceType
  const rollingWeekStarts = React.useMemo(
    () => buildRollingWeekStarts({ selectedWeekStart: weekStart }),
    [weekStart]
  )
  const calendarWeekStarts = React.useMemo(
    () => buildMonthWeekStarts(calendarMonth),
    [calendarMonth]
  )
  const weekPreviewByWeekStart = useRotaWeekPreviews({
    enabled: open,
    locationId,
    weekStarts: [
      currentWeekStart,
      weekStart,
      ...rollingWeekStarts,
      ...calendarWeekStarts,
    ],
  })
  const selectedWeekRange = getWeekRangeFromStart(weekStart)
  const previewQuery = useRotaCreationPreviewQuery({
    enabled: open,
    locationId,
    weekStart,
  })
  const preview = previewQuery.data ?? null
  const isPreviewPending = previewQuery.isPending || previewQuery.isFetching
  const previewErrorMessage = previewQuery.error
    ? getErrorMessage(previewQuery.error)
    : null

  React.useEffect(() => {
    if (!open) {
      return
    }

    autoAdvancedRef.current = false
    setError(null)
    setPickerMode("list")
    form.setFieldValue(
      "locationId",
      selectedLocation?.id ?? locations.at(0)?.id ?? ""
    )
    form.setFieldValue("weekStart", currentWeekStart)
    form.setFieldValue("sourceType", defaultSourceType)
    form.setFieldValue("templateId", "")
    setCalendarMonth(parseISO(`${currentWeekStart}T12:00:00`))
  }, [
    currentWeekStart,
    defaultSourceType,
    form,
    locations,
    open,
    selectedLocation?.id,
  ])

  React.useEffect(() => {
    setCalendarMonth(parseISO(`${weekStart}T12:00:00`))
  }, [weekStart])

  React.useEffect(() => {
    const currentWeekPreview = weekPreviewByWeekStart[currentWeekStart]

    if (
      !open ||
      autoAdvancedRef.current ||
      weekStart !== currentWeekStart ||
      !currentWeekPreview ||
      currentWeekPreview.isPending ||
      !currentWeekPreview.existingRota
    ) {
      return
    }

    const nextAvailableWeekStart =
      rollingWeekStarts.find((candidateWeekStart) => {
        if (candidateWeekStart === currentWeekStart) {
          return false
        }

        return (
          weekPreviewByWeekStart[candidateWeekStart]?.existingRota === false
        )
      }) ?? normalizeWeekStart(addWeeks(new Date(), 1))

    autoAdvancedRef.current = true
    form.setFieldValue("weekStart", nextAvailableWeekStart)
  }, [
    currentWeekStart,
    form,
    open,
    rollingWeekStarts,
    weekPreviewByWeekStart,
    weekStart,
  ])

  React.useEffect(() => {
    if (
      sourceType === "previous-week" &&
      preview &&
      !preview.previousPublished
    ) {
      form.setFieldValue("sourceType", "blank")
    }
  }, [form, preview, sourceType])

  React.useEffect(() => {
    if (
      sourceType === "template" &&
      preview &&
      preview.templates.length === 0
    ) {
      form.setFieldValue("sourceType", "blank")
      form.setFieldValue("templateId", "")
    }
  }, [form, preview, sourceType])

  const availableTemplates = preview?.templates ?? []
  const primaryLabel = preview?.existingRota
    ? "Open existing rota"
    : sourceType === "template"
      ? "Create from template"
      : sourceType === "previous-week"
        ? "Copy previous week"
        : "Create draft rota"
  const TriggerIcon = triggerIcon === "template" ? FileStackIcon : PlusIcon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant={triggerVariant}
            className={cn("gap-2", triggerClassName)}
          />
        }
      >
        <TriggerIcon className="size-4" />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent className="max-w-[min(100%-1.5rem,46rem)] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
          <DialogTitle className="text-lg">Create new rota</DialogTitle>
          <DialogDescription>
            Choose a location, pick a week, and decide how you want to start.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex max-h-[min(78vh,42rem)] flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <div className="space-y-5">
              <FieldGroup className="gap-5">
                <form.Field
                  name="weekStart"
                  validators={{
                    onSubmit: createZodFieldValidator(
                      createRotaDialogSchema.shape.weekStart
                    ),
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Week</FieldLabel>
                      <FieldContent className="space-y-3">
                        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="inline-flex items-center gap-2 text-sm font-medium">
                                <CalendarDaysIcon className="size-4" />
                                {formatWeekRangeLabel(field.state.value)}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {selectedWeekRange.summaryLabel}
                              </div>
                            </div>
                            {preview?.existingRota ? (
                              <Badge variant="secondary">Already exists</Badge>
                            ) : (
                              <Badge variant="outline">New week</Badge>
                            )}
                          </div>
                        </div>
                        <form.Field
                          name="locationId"
                          validators={{
                            onSubmit: createZodFieldValidator(
                              createRotaDialogSchema.shape.locationId
                            ),
                          }}
                        >
                          {(field) => (
                            <Field>
                              <FieldLabel htmlFor={field.name}>
                                Location
                              </FieldLabel>
                              <FieldContent>
                                <NativeSelect
                                  id={field.name}
                                  name={field.name}
                                  className="w-1/4"
                                  disabled={locations.length === 1}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => {
                                    field.handleChange(event.target.value)
                                    form.setFieldValue("templateId", "")
                                    autoAdvancedRef.current = false
                                  }}
                                >
                                  {locations.map((location) => (
                                    <NativeSelectOption
                                      key={location.id}
                                      value={location.id}
                                    >
                                      {location.name}
                                    </NativeSelectOption>
                                  ))}
                                </NativeSelect>

                                <FieldError>{getFieldError(field)}</FieldError>
                              </FieldContent>
                            </Field>
                          )}
                        </form.Field>

                        <div className="flex flex-wrap gap-2">
                          <WeekQuickAction
                            label="This week"
                            isActive={field.state.value === currentWeekStart}
                            onClick={() => {
                              autoAdvancedRef.current = false
                              field.handleChange(currentWeekStart)
                            }}
                          />
                          <WeekQuickAction
                            label="Next week"
                            onClick={() =>
                              field.handleChange(
                                normalizeWeekStart(addWeeks(new Date(), 1))
                              )
                            }
                          />
                          <WeekQuickAction
                            label="+2 weeks"
                            onClick={() =>
                              field.handleChange(
                                normalizeWeekStart(addWeeks(new Date(), 2))
                              )
                            }
                          />
                          <WeekQuickAction
                            label="+4 weeks"
                            onClick={() =>
                              field.handleChange(
                                normalizeWeekStart(addWeeks(new Date(), 4))
                              )
                            }
                          />
                        </div>

                        <Tabs
                          value={pickerMode}
                          onValueChange={(value) =>
                            setPickerMode(value as PickerMode)
                          }
                        >
                          <TabsList className="w-full sm:w-fit">
                            <TabsTrigger value="list">Week list</TabsTrigger>
                            <TabsTrigger value="calendar">
                              Calendar rows
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="list">
                            <NewRotaWeekListPicker
                              weekStarts={rollingWeekStarts.map(
                                (candidateWeekStart) => ({
                                  weekStart: candidateWeekStart,
                                  preview:
                                    weekPreviewByWeekStart[candidateWeekStart],
                                })
                              )}
                              selectedWeekStart={field.state.value}
                              onSelect={field.handleChange}
                            />
                          </TabsContent>

                          <TabsContent value="calendar">
                            <NewRotaWeekRowCalendar
                              month={calendarMonth}
                              selectedWeekStart={field.state.value}
                              onMonthChange={setCalendarMonth}
                              onSelect={field.handleChange}
                              previewByWeekStart={weekPreviewByWeekStart}
                            />
                          </TabsContent>
                        </Tabs>

                        <FieldError>{getFieldError(field)}</FieldError>
                      </FieldContent>
                    </Field>
                  )}
                </form.Field>

                <form.Field
                  name="sourceType"
                  validators={{
                    onSubmit: createZodFieldValidator(
                      createRotaDialogSchema.shape.sourceType
                    ),
                  }}
                >
                  {(field) => (
                    <NewRotaSourcePicker
                      value={field.state.value}
                      onChange={field.handleChange}
                      preview={preview}
                      isPreviewPending={isPreviewPending}
                      error={getFieldError(field)}
                    />
                  )}
                </form.Field>

                {sourceType === "template" ? (
                  <form.Field
                    name="templateId"
                    validators={{
                      onSubmit: createZodFieldValidator(
                        createRotaDialogSchema.shape.templateId.unwrap()
                      ),
                    }}
                  >
                    {(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Template</FieldLabel>
                        <FieldContent>
                          <NativeSelect
                            id={field.name}
                            name={field.name}
                            className="w-full"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                          >
                            <NativeSelectOption value="">
                              Choose a template
                            </NativeSelectOption>
                            {availableTemplates.map((template) => (
                              <NativeSelectOption
                                key={template.id}
                                value={template.id}
                              >
                                {template.name}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                          <FieldDescription>
                            Templates stay available inside the organization for
                            faster setup.
                          </FieldDescription>
                          <FieldError>{getFieldError(field)}</FieldError>
                        </FieldContent>
                      </Field>
                    )}
                  </form.Field>
                ) : null}
              </FieldGroup>

              <FormErrorMessage message={error ?? previewErrorMessage} />
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-background/95 px-4 py-4 sm:px-6 sm:py-5">
            <DialogClose
              render={<Button type="button" variant="outline" size="lg" />}
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              size="lg"
              disabled={createRotaDraftMutation.isPending || isPreviewPending}
            >
              {createRotaDraftMutation.isPending ? "Working..." : primaryLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function WeekQuickAction({
  label,
  onClick,
  isActive = false,
}: {
  label: string
  onClick: () => void
  isActive?: boolean
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={isActive ? "default" : "outline"}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

export { NewRotaDialog }
