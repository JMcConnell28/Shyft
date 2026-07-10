"use client"

import * as React from "react"
import { useForm, useStore } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  Building2Icon,
  CalendarDaysIcon,
  CircleCheckIcon,
  FileStackIcon,
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
        className="w-[calc(100%-2rem)] max-w-[34rem] gap-0 overflow-hidden rounded-[18px] bg-white p-0 text-[#11245a] shadow-[0_18px_60px_rgba(15,23,42,0.18)] ring-1 ring-[#dfe5f0]"
      >
        <DialogClose
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 size-8 rounded-full bg-white text-[#11245a] hover:bg-[#f5f7fb]"
            />
          }
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogHeader className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
          <DialogTitle className="text-xl leading-none font-bold">
            New rota
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-[#7a86a4]">
            Choose the location, week, and starting point.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex max-h-[min(82vh,43rem)] flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4 sm:px-6">
            <div className="grid gap-2 sm:grid-cols-2">
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
                    icon={Building2Icon}
                    iconTone="green"
                    label="Location"
                    value={field.state.value}
                    options={locationOptions}
                    disabled={locations.length === 1}
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

          <div className="grid grid-cols-2 gap-2.5 border-t border-[#dfe5f0] bg-[#fbfcff] px-5 py-4 sm:px-6">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="default"
                  className="h-9 rounded-[10px] bg-white text-xs font-bold text-[#0069ff] hover:bg-white"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              size="default"
              className="h-9 gap-2 rounded-[10px] bg-[#00a84f] text-xs font-bold text-white shadow-[0_8px_18px_rgba(0,168,79,0.18)] hover:bg-[#009647]"
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
