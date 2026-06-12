"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type {
  ClockAction,
  ClockShiftSegment,
  GpsCoordinates,
} from "@/features/time-clock/types"
import { timeClockQueryKeys } from "@/features/time-clock/query-keys"
import {
  managerClockOverride,
  submitEmployeeClock,
  updateClockSettings,
} from "@/features/time-clock/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useEmployeeClockMutation(input: { token: string; userId: string }) {
  const queryClient = useQueryClient()
  const submitEmployeeClockFn = useServerFn(submitEmployeeClock)

  return useMutation({
    mutationFn: (variables: {
      action: ClockAction
      gps?: GpsCoordinates | null
      shiftSegment?: ClockShiftSegment
    }) =>
      submitEmployeeClockFn({
        data: {
          ...input,
          ...variables,
        },
      }),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: timeClockQueryKeys.employee(input),
      })
      showSuccessToast(
        variables.action === "clock_in" ? "Clocked in." : "Clocked out.",
      )
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update your clock status.",
      })
    },
  })
}

function useManagerClockMutations(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const managerClockOverrideFn = useServerFn(managerClockOverride)

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: timeClockQueryKeys.all,
    })
  }

  return {
    overrideMutation: useMutation({
      mutationFn: (variables: {
        action: ClockAction
        employeeId: string
        locationId: string
        reason: string
      }) =>
        managerClockOverrideFn({
          data: {
            ...input,
            ...variables,
          },
        }),
      onSuccess: async (_, variables) => {
        await invalidate()
        showSuccessToast(
          variables.action === "clock_in"
            ? "Team member clocked in."
            : "Team member clocked out.",
        )
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not apply that override.",
        })
      },
    }),
  }
}

function useClockSettingsMutations(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const updateClockSettingsFn = useServerFn(updateClockSettings)

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: timeClockQueryKeys.all,
    })
  }

  return {
    updateSettingsMutation: useMutation({
      mutationFn: (variables: {
        isEnabled: boolean
        latitude: number | null
        locationId: string
        longitude: number | null
        maxAccuracyMeters: number
        radiusMeters: number
        timezone: string
        earlyClockInGraceMinutes: number
        earlyStartReviewMinutes: number
        forgottenClockOutAlertMinutes: number
        hardReviewAfterMinutes: number
        lateClockOutGraceMinutes: number
        lateFinishReviewMinutes: number
      }) =>
        updateClockSettingsFn({
          data: {
            ...input,
            ...variables,
          },
        }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Clock settings saved.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not save clock settings.",
        })
      },
    }),
  }
}

export {
  useClockSettingsMutations,
  useEmployeeClockMutation,
  useManagerClockMutations,
}
