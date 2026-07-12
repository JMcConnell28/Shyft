"use client"

import * as React from "react"
import { useForm, useStore } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CircleCheckIcon,
  FileStackIcon,
  MapPinIcon,
  PlusCircleIcon,
  PlusIcon,
  XIcon,
} from "lucide-react"

import type { NewRotaSource } from "@/features/rota/schemas/rota-schemas"
import type { AccessibleRotaLocation } from "@/features/rota/types"
import { FormErrorMessage } from "@/components/forms/form-error-message"
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
import {
  DialogSelectRow,
  TemplateSelect,
} from "@/features/rota/components/new-rota-dialog-fields"
import { rotaListPrimaryButtonClassName } from "@/features/rota/constants/rota-list-styles"
import { NewRotaSourcePicker } from "@/features/rota/components/new-rota-source-picker"
import { useCreateRotaDraftMutation } from "@/features/rota/hooks/use-create-rota-draft-mutation"
import { useRotaCreationPreviewQuery } from "@/features/rota/hooks/use-rota-creation-preview-query"
import {
  buildRollingWeekStarts,
  formatWeekRangeLabel,
} from "@/features/rota/utils/week-picker"
import { getErrorMessage } from "@/lib/errors"
import { getFieldError } from "@/lib/forms"
import { createRotaDialogSchema, normalizeWeekStart } from "@/lib/rota-schemas"
import { cn } from "@/lib/utils"
import { createZodFieldValidator } from "@/lib/validation"

type NewRotaDialogProps = {
  locations: Array<AccessibleRotaLocation>
  selectedLocation: AccessibleRotaLocation | null
  triggerLabel: string
  triggerClassName?: string
  triggerIcon?: "plus" | "template"
  disabled?: boolean
  defaultSourceType?: NewRotaSource
  workspaceType?: "organization" | "location"
}

function NewRotaDialog({
  locations,
  selectedLocation,
  triggerLabel,
  triggerClassName,
  triggerIcon = "plus",
  disabled = false,
  defaultSourceType = "blank",
  workspaceType = "organization",
}: NewRotaDialogProps) {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const createRotaDraftMutation = useCreateRotaDraftMutation()
  const fallbackLocationId = selectedLocation?.id ?? locations.at(0)?.id ?? ""
  const currentWeekStart = React.useMemo(
    () => normalizeWeekStart(new Date()),
    []
  )

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

  const formValues = useStore(form.store, (state) => state.values)
  const locationId = formValues.locationId
  const weekStart = formValues.weekStart
  const sourceType = formValues.sourceType
  const weekOptions = React.useMemo(
    () => buildRollingWeekStarts({ selectedWeekStart: weekStart }),
    [weekStart]
  )
  const locationOptions = React.useMemo(
    () =>
      locations.length === 0
        ? [{ value: "", label: "No locations" }]
        : locations.map((location) => ({
            value: location.id,
            label: location.name,
          })),
    [locations]
  )
  const weekSelectOptions = React.useMemo(
    () =>
      weekOptions.map((candidateWeekStart) => ({
        value: candidateWeekStart,
        label: formatWeekRangeLabel(candidateWeekStart),
      })),
    [weekOptions]
  )
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
  const availableTemplates = preview?.templates ?? []
  const hasExistingRota = Boolean(preview?.existingRota)
  const TriggerIcon = triggerIcon === "template" ? FileStackIcon : PlusIcon
  const PrimaryIcon = hasExistingRota ? ArrowRightIcon : PlusCircleIcon
  const primaryLabel = createRotaDraftMutation.isPending
    ? hasExistingRota
      ? "Opening..."
      : "Creating..."
    : hasExistingRota
      ? "Open existing rota"
      : "Create rota"

  React.useEffect(() => {
    if (!open) {
      return
    }

    setError(null)
    form.setFieldValue(
      "locationId",
      selectedLocation?.id ?? locations.at(0)?.id ?? ""
    )
    form.setFieldValue("weekStart", currentWeekStart)
    form.setFieldValue("sourceType", defaultSourceType)
    form.setFieldValue("templateId", "")
  }, [
    currentWeekStart,
    defaultSourceType,
    form,
    locations,
    open,
    selectedLocation?.id,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-[#101b31]/55 backdrop-blur-[1px]"
        className="top-auto bottom-4 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[34rem] translate-y-0 flex-col gap-0 overflow-hidden rounded-[26px] bg-white p-0 text-[#10285c] shadow-[0_20px_60px_rgba(8,18,38,0.28)] ring-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:rounded-[22px] sm:ring-1 sm:ring-[#dfe5f0] data-open:slide-in-from-bottom-6 data-closed:slide-out-to-bottom-6"
      >
        <DialogClose
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-5 right-5 size-9 rounded-full bg-[#f3f5f9] text-[#10285c] hover:bg-[#e9edf4]"
            />
          }
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader className="px-6 pt-8 pb-5 sm:px-7 sm:pt-7">
          <DialogTitle className="text-[26px] leading-none font-bold tracking-[-0.035em] sm:text-2xl">
            New rota
          </DialogTitle>
          <DialogDescription className="mt-1 max-w-[calc(100%-2.5rem)] text-sm leading-5 font-medium text-[#526991]">
            Choose a week, location and how you want to start
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <div className="flex-1 space-y-3 overflow-y-auto px-6 pb-5 sm:px-7">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-2 [&>div:first-child]:order-2 sm:[&>div:first-child]:order-1 [&>div:nth-child(2)]:order-1 sm:[&>div:nth-child(2)]:order-2">
              <form.Field
                name="locationId"
                validators={{
                  onSubmit: createZodFieldValidator(
                    createRotaDialogSchema.shape.locationId
                  ),
                }}
              >
                {(field) => (
                  <DialogSelectRow
                    id={field.name}
                    icon={MapPinIcon}
                    iconTone="green"
                    label="Location"
                    value={field.state.value}
                    options={locationOptions}
                    error={getFieldError(field)}
                    onBlur={field.handleBlur}
                    onChange={(value) => {
                      field.handleChange(value)
                      form.setFieldValue("templateId", "")
                    }}
                  />
                )}
              </form.Field>

              <form.Field
                name="weekStart"
                validators={{
                  onSubmit: createZodFieldValidator(
                    createRotaDialogSchema.shape.weekStart
                  ),
                }}
              >
                {(field) => (
                  <DialogSelectRow
                    id={field.name}
                    icon={CalendarDaysIcon}
                    iconTone="blue"
                    label="Week"
                    value={field.state.value}
                    options={weekSelectOptions}
                    error={getFieldError(field)}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>
            </div>

            {hasExistingRota ? (
              <ExistingRotaNotice />
            ) : (
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
            )}

            {!hasExistingRota && sourceType === "template" ? (
              <form.Field
                name="templateId"
                validators={{
                  onSubmit: createZodFieldValidator(
                    createRotaDialogSchema.shape.templateId.unwrap()
                  ),
                }}
              >
                {(field) => (
                  <TemplateSelect
                    value={field.state.value}
                    templates={availableTemplates}
                    error={getFieldError(field)}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  />
                )}
              </form.Field>
            ) : null}

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
              disabled={createRotaDraftMutation.isPending || isPreviewPending}
            >
              <PrimaryIcon className="size-4" />
              {primaryLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ExistingRotaNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-[12px] border border-[#c8d5f7] bg-[#f3f7ff] px-3 py-2.5 text-[#11245a]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white text-[#0069ff] shadow-[0_4px_12px_rgba(30,50,96,0.06)]">
        <CircleCheckIcon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold">A rota already exists for this week</p>
        <p className="mt-1 text-xs leading-5 font-medium text-[#6c7898]">
          Opening it keeps one rota per location and week.
        </p>
      </div>
    </div>
  )
}

export { NewRotaDialog }
