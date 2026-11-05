"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type {
  OnboardingBusinessType,
  OnboardingPlanningMode,
} from "@/features/onboarding/schemas/onboarding-schemas"
import { applyCreatedLocation } from "@/features/settings/utils/location-mutation-cache"
import { createLocation } from "@/features/settings/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useLocationSettingsMutations(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const createLocationFn = useServerFn(createLocation)

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string
      businessType: OnboardingBusinessType
      planningMode: OnboardingPlanningMode
      zoneNames: Array<string>
      worksiteName: string
    }) =>
      createLocationFn({
        data: {
          ...input,
          ...data,
          organizationId: input.organizationId ?? "",
        },
      }),
    onSuccess: async (location) => {
      await applyCreatedLocation(queryClient, input, location)
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
