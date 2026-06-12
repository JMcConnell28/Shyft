"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { timesheetQueryKeys } from "@/features/timesheets/query-keys"
import { updateTimesheetEntry } from "@/features/timesheets/server-fns"
import type {
  TimesheetScopeInput,
  UpdateTimesheetEntryInput,
} from "@/features/timesheets/types"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useTimesheetMutations(input: TimesheetScopeInput) {
  const queryClient = useQueryClient()
  const updateTimesheetEntryFn = useServerFn(updateTimesheetEntry)

  return {
    updateEntryMutation: useMutation({
      mutationFn: (
        variables: Omit<
          UpdateTimesheetEntryInput,
          "locationId" | "organizationId" | "userId" | "weekStart"
        >,
      ) =>
        updateTimesheetEntryFn({
          data: {
            ...input,
            ...variables,
          },
        }),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: timesheetQueryKeys.all,
        })
        showSuccessToast("Timesheet entry updated.")
      },
      onError: (error) => {
        showErrorToast(error, {
          fallbackMessage: "We could not update that timesheet entry.",
        })
      },
    }),
  }
}

export { useTimesheetMutations }
