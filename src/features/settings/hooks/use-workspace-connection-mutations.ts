"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { settingsQueryKeys } from "@/features/settings/query-keys"
import {
  createOrganizationFromLocation,
  moveLocationToOrganization,
  moveLocationToOrganizationBilling,
} from "@/features/settings/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useWorkspaceConnectionMutations() {
  const queryClient = useQueryClient()
  const createOrganizationFromLocationFn = useServerFn(
    createOrganizationFromLocation,
  )
  const moveLocationToOrganizationFn = useServerFn(moveLocationToOrganization)
  const moveLocationToOrganizationBillingFn = useServerFn(
    moveLocationToOrganizationBilling,
  )

  const invalidateSettings = async () => {
    await queryClient.invalidateQueries({
      queryKey: settingsQueryKeys.all,
    })
  }

  const moveLocationMutation = useMutation({
    mutationFn: (input: {
      billingMode: "keep" | "organization"
      locationId: string
      targetOrganizationId: string
    }) =>
      moveLocationToOrganizationFn({
        data: input,
      }),
    onSuccess: async (result) => {
      await invalidateSettings()
      showSuccessToast(
        result.stripeSyncWarning ??
          "Location connection updated.",
      )
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not move that location.",
      })
    },
  })

  const createOrganizationMutation = useMutation({
    mutationFn: (input: {
      billingMode: "keep" | "organization"
      locationId: string
      name: string
      slug: string
    }) =>
      createOrganizationFromLocationFn({
        data: input,
      }),
    onSuccess: async (result) => {
      await invalidateSettings()
      showSuccessToast(
        result.stripeSyncWarning ??
          "Organization created and location connected.",
      )
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not create that organization.",
      })
    },
  })

  const moveBillingMutation = useMutation({
    mutationFn: (input: {
      locationId: string
      organizationId: string
    }) =>
      moveLocationToOrganizationBillingFn({
        data: input,
      }),
    onSuccess: async (result) => {
      await invalidateSettings()
      showSuccessToast(
        result.stripeSyncWarning ??
          "Location billing moved.",
      )
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not move that billing.",
      })
    },
  })

  return {
    createOrganizationFromLocation: createOrganizationMutation.mutateAsync,
    isCreatingOrganization: createOrganizationMutation.isPending,
    isMovingBilling: moveBillingMutation.isPending,
    isMovingLocation: moveLocationMutation.isPending,
    moveLocationToOrganization: moveLocationMutation.mutateAsync,
    moveLocationToOrganizationBilling: moveBillingMutation.mutateAsync,
  }
}

export { useWorkspaceConnectionMutations }
