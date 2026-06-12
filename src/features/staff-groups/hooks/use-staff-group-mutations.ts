"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import { rotaQueryKeys } from "@/features/rota/query-keys"
import { staffGroupQueryKeys } from "@/features/staff-groups/query-keys"
import {
  type StaffGroupColor,
} from "@/features/staff-groups/constants/staff-group-colors"
import {
  assignEmployeeStaffGroup,
  bulkAssignEmployeeStaffGroup,
  createStaffGroup,
  deleteStaffGroup,
  renameStaffGroup,
  removeEmployeeFromWorkspace,
  setEmployeeActiveStatus,
  setStaffGroupColor,
} from "@/features/staff-groups/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function useStaffGroupMutations(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const createStaffGroupFn = useServerFn(createStaffGroup)
  const renameStaffGroupFn = useServerFn(renameStaffGroup)
  const setStaffGroupColorFn = useServerFn(setStaffGroupColor)
  const deleteStaffGroupFn = useServerFn(deleteStaffGroup)
  const assignEmployeeStaffGroupFn = useServerFn(assignEmployeeStaffGroup)
  const bulkAssignEmployeeStaffGroupFn = useServerFn(
    bulkAssignEmployeeStaffGroup,
  )
  const setEmployeeActiveStatusFn = useServerFn(setEmployeeActiveStatus)
  const removeEmployeeFromWorkspaceFn = useServerFn(removeEmployeeFromWorkspace)

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: staffGroupQueryKeys.all,
      }),
      queryClient.invalidateQueries({
        queryKey: rotaQueryKeys.all,
      }),
      queryClient.invalidateQueries({
        queryKey: ["sidebar-invite-link"],
      }),
    ])
  }

  const createMutation = useMutation({
    mutationFn: (variables: { name: string; color: StaffGroupColor }) =>
      createStaffGroupFn({
        data: {
          ...input,
          ...variables,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Staff group created.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not create that staff group.",
      })
    },
  })

  const renameMutation = useMutation({
    mutationFn: (variables: { groupId: string; name: string }) =>
      renameStaffGroupFn({
        data: {
          ...input,
          ...variables,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Staff group updated.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that staff group.",
      })
    },
  })

  const setColorMutation = useMutation({
    mutationFn: (variables: { groupId: string; color: string }) =>
      setStaffGroupColorFn({
        data: {
          ...input,
          ...variables,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Staff group color updated.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that group color.",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (groupId: string) =>
      deleteStaffGroupFn({
        data: {
          ...input,
          groupId,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Staff group deleted.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not delete that staff group.",
      })
    },
  })

  const assignMutation = useMutation({
    mutationFn: (variables: { employeeId: string; groupId: string }) =>
      assignEmployeeStaffGroupFn({
        data: {
          ...input,
          ...variables,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Team member updated.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that team member.",
      })
    },
  })

  const bulkAssignMutation = useMutation({
    mutationFn: (variables: { employeeIds: string[]; groupId: string }) =>
      bulkAssignEmployeeStaffGroupFn({
        data: {
          ...input,
          ...variables,
        },
      }),
    onSuccess: async (_, variables) => {
      await invalidate()
      showSuccessToast(
        `${variables.employeeIds.length} team member${variables.employeeIds.length === 1 ? "" : "s"} moved.`,
      )
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update those team members.",
      })
    },
  })

  const setActiveMutation = useMutation({
    mutationFn: (variables: { employeeId: string; isActive: boolean }) =>
      setEmployeeActiveStatusFn({
        data: {
          ...input,
          ...variables,
        },
      }),
    onSuccess: async (_, variables) => {
      await invalidate()
      showSuccessToast(
        `Team member ${variables.isActive ? "activated" : "deactivated"}.`,
      )
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that team member.",
      })
    },
  })

  const removeEmployeeMutation = useMutation({
    mutationFn: (employeeId: string) =>
      removeEmployeeFromWorkspaceFn({
        data: {
          ...input,
          employeeId,
        },
      }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Team member removed.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not remove that team member.",
      })
    },
  })

  return {
    createMutation,
    renameMutation,
    setColorMutation,
    deleteMutation,
    assignMutation,
    bulkAssignMutation,
    removeEmployeeMutation,
    setActiveMutation,
  }
}

export { useStaffGroupMutations }
