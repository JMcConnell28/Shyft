"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { settingsQueryKeys } from "@/features/settings/query-keys"
import { createLocation } from "@/features/settings/server-fns"
import type {
  OnboardingBusinessType,
  OnboardingPlanningMode,
} from "@/features/onboarding/schemas/onboarding-schemas"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useLocationSettingsMutations(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const createLocationFn = useServerFn(createLocation)

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.all,
      }),
      queryClient.invalidateQueries({
        queryKey: rotaQueryKeys.all,
      }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string
      businessType: OnboardingBusinessType
      planningMode: OnboardingPlanningMode
      zoneNames: string[]
      worksiteName: string
    }) =>
      createLocationFn({
        data: {
          ...input,
          ...data,
          organizationId: input.organizationId ?? "",
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Location created.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not create that location.",
      })
    },
  })

  return {
    createMutation,
  }
}

export { useLocationSettingsMutations }
