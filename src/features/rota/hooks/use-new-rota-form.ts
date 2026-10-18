import { useEffect, useMemo, useState } from "react"
import { useForm, useStore } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useCreateRotaDraftMutation } from "./use-create-rota-draft-mutation"
import { useRotaCreationPreviewQuery } from "./use-rota-creation-preview-query"
import type { NewRotaDialogContentProps } from "../types/new-rota-dialog"
import {
  buildRollingWeekStarts,
  formatWeekRangeLabel,
} from "@/features/rota/utils/week-picker"
import { getErrorMessage } from "@/lib/errors"
import { normalizeWeekStart } from "@/lib/rota-schemas"

function useNewRotaForm({
  locations,
  selectedLocation,
  defaultSourceType = "blank",
  initialWeekStart,
  open,
}: NewRotaDialogContentProps) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const mutation = useCreateRotaDraftMutation()
  const currentWeekStart = useMemo(
    () => normalizeWeekStart(initialWeekStart ?? new Date()),
    [initialWeekStart]
  )
  const form = useForm({
    defaultValues: {
      locationId: selectedLocation?.id ?? locations.at(0)?.id ?? "",
      weekStart: currentWeekStart,
      sourceType: defaultSourceType,
      templateId: "",
    },
    onSubmit: async () => {
      setError(null)
      try {
        const result = await mutation.mutateAsync({
          locationId: form.state.values.locationId,
          weekStart: form.state.values.weekStart,
          sourceType: form.state.values.sourceType,
          templateId: form.state.values.templateId || undefined,
        })
        await navigate({
          to: "/app/$workspaceSlug/rota/$locationSlug/$rotaId",
          params: {
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
  const { locationId, weekStart, sourceType } = useStore(
    form.store,
    (state) => state.values
  )
  const locationOptions = useMemo(
    () =>
      locations.length === 0
        ? [{ value: "", label: "No locations" }]
        : locations.map((location) => ({
            value: location.id,
            label: location.name,
          })),
    [locations]
  )
  const weekSelectOptions = useMemo(
    () =>
      buildRollingWeekStarts({ selectedWeekStart: weekStart }).map((value) => ({
        value,
        label: formatWeekRangeLabel(value),
      })),
    [weekStart]
  )
  const previewQuery = useRotaCreationPreviewQuery({
    enabled: open,
    locationId,
    weekStart,
  })
  const preview = previewQuery.data ?? null

  useEffect(() => {
    if (!open) return
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

  useEffect(() => {
    if (
      sourceType === "previous-week" &&
      preview &&
      !preview.previousPublished
    ) {
      form.setFieldValue("sourceType", "blank")
    }
    if (
      sourceType === "template" &&
      preview &&
      preview.templates.length === 0
    ) {
      form.setFieldValue("sourceType", "blank")
      form.setFieldValue("templateId", "")
    }
  }, [form, preview, sourceType])

  return {
    form,
    error,
    sourceType,
    locationOptions,
    weekSelectOptions,
    preview,
    availableTemplates: preview?.templates ?? [],
    hasExistingRota: Boolean(preview?.existingRota),
    isSubmitting: mutation.isPending,
    isPreviewPending:
      previewQuery.isSelectingWeek ||
      previewQuery.isPending ||
      previewQuery.isFetching,
    previewErrorMessage: previewQuery.error
      ? getErrorMessage(previewQuery.error)
      : null,
  }
}

type NewRotaForm = ReturnType<typeof useNewRotaForm>

export { useNewRotaForm }
export type { NewRotaForm }
