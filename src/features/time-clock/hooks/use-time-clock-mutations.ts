"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { updateTimeAttendanceAddon } from "@/features/billing/server-fns"
import type {
  ClockAction,
  ClockReason,
  ClockShiftSegment,
  EarlyClockInMode,
} from "@/features/time-clock/types"
import { timeClockQueryKeys } from "@/features/time-clock/query-keys"
import {
  approveTimeEntryAsRecorded,
  generateAdminClockTagSetup,
  managerClockOverride,
  submitEmployeeClock,
  updateClockSettings,
} from "@/features/time-clock/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useEmployeeClockMutation(input: {
  scanSessionId: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const submitEmployeeClockFn = useServerFn(submitEmployeeClock)

  return useMutation({
    mutationFn: (variables: {
      action: ClockAction
      earlyClockInMode?: EarlyClockInMode
      reason?: ClockReason
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
        variables.action === "clock_in" ? "Clocked in." : "Clocked out."
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
  const approveTimeEntryAsRecordedFn = useServerFn(approveTimeEntryAsRecorded)
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
            : "Team member clocked out."
        )
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not apply that override.",
        })
      },
    }),
    approveAsRecordedMutation: useMutation({
      mutationFn: (variables: { entryId: string }) =>
        approveTimeEntryAsRecordedFn({
          data: {
            ...input,
            ...variables,
          },
        }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast("Time entry approved.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not approve that entry.",
        })
      },
    }),
  }
}

function useAdminClockTagMutations(input: { userId: string }) {
  const queryClient = useQueryClient()
  const generateAdminClockTagSetupFn = useServerFn(generateAdminClockTagSetup)

  return {
    generateMutation: useMutation({
      mutationFn: (variables: { locationId: string }) =>
        generateAdminClockTagSetupFn({
          data: {
            ...input,
            ...variables,
          },
        }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: timeClockQueryKeys.adminTags(input),
        })
        showSuccessToast("Tag setup generated.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not generate tag setup data.",
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
  const updateTimeAttendanceAddonFn = useServerFn(updateTimeAttendanceAddon)

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: timeClockQueryKeys.all,
    })
  }

  return {
    activateStationMutation: useMutation({
      mutationFn: (variables: { locationId: string }) =>
        updateTimeAttendanceAddonFn({
          data: {
            action: "activate",
            confirmationAccepted: true,
            locationId: variables.locationId,
          },
        }),
      onSuccess: async () => {
        await invalidate()
        showSuccessToast(
          "Clock-in station activated. Time & Attendance billing is now active."
        )
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not activate the clock-in station.",
        })
      },
    }),
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
        lateClockInGraceMinutes: number
        lateClockOutGraceMinutes: number
        lateFinishReviewMinutes: number
        lateStartReviewMinutes: number
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
  useAdminClockTagMutations,
  useClockSettingsMutations,
  useEmployeeClockMutation,
  useManagerClockMutations,
}
