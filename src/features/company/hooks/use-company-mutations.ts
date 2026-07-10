"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"

import type { EmployeeCompensationInput } from "@/features/staff-groups/types"
import type { AssignableOrganizationRole } from "@/lib/auth/permissions"
import type {
  CompanyEmployeeRotaNoteCategory,
  CompanyEmployeeRotaNotePriority,
} from "@/features/company/types"
import { companyQueryKeys } from "@/features/company/query-keys"
import { rotaQueryKeys } from "@/features/rota/query-keys"
import { staffGroupQueryKeys } from "@/features/staff-groups/query-keys"
import {
  archiveCompanyEmployeeRotaNote,
  bulkUpdateCompanyEmployeePayrollIds,
  createCompanyEmployeeRotaNote,
  rehireCompanyEmployee,
  removeCompanyEmployee,
  updateCompanyEmployeeCompensation,
  updateCompanyEmployeeLocationActivity,
  updateCompanyEmployeePayrollId,
  updateCompanyEmployeeRole,
  updateCompanyEmployeeRotaNote,
} from "@/features/company/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

type RotaNoteMutationInput = {
  note: {
    body: string
    category: CompanyEmployeeRotaNoteCategory
    isPinned: boolean
    locationId: string | null
    priority: CompanyEmployeeRotaNotePriority
    title: string
    zoneId: string | null
  }
  employeeId: string
}

function useCompanyMutations(input: {
  organizationId?: string
  locationId?: string
  userId: string
}) {
  const queryClient = useQueryClient()
  const updateRoleFn = useServerFn(updateCompanyEmployeeRole)
  const updateLocationActivityFn = useServerFn(
    updateCompanyEmployeeLocationActivity
  )
  const updateCompensationFn = useServerFn(updateCompanyEmployeeCompensation)
  const updatePayrollIdFn = useServerFn(updateCompanyEmployeePayrollId)
  const bulkUpdatePayrollIdsFn = useServerFn(
    bulkUpdateCompanyEmployeePayrollIds
  )
  const createRotaNoteFn = useServerFn(createCompanyEmployeeRotaNote)
  const updateRotaNoteFn = useServerFn(updateCompanyEmployeeRotaNote)
  const archiveRotaNoteFn = useServerFn(archiveCompanyEmployeeRotaNote)
  const removeEmployeeFn = useServerFn(removeCompanyEmployee)
  const rehireEmployeeFn = useServerFn(rehireCompanyEmployee)

  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: staffGroupQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: rotaQueryKeys.all }),
    ])
  }

  const roleMutation = useMutation({
    mutationFn: (variables: {
      employeeId: string
      role: AssignableOrganizationRole
    }) => updateRoleFn({ data: { ...input, ...variables } }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Role updated.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that role.",
      })
    },
  })

  const locationActivityMutation = useMutation({
    mutationFn: (variables: {
      employeeId: string
      isActive: boolean
      targetLocationId: string
    }) => updateLocationActivityFn({ data: { ...input, ...variables } }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Location activity updated.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that location.",
      })
    },
  })

  const removeEmployeeMutation = useMutation({
    mutationFn: (variables: { employeeId: string }) =>
      removeEmployeeFn({ data: { ...input, ...variables } }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Employee removed from the organisation.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not remove that employee.",
      })
    },
  })

  const rehireEmployeeMutation = useMutation({
    mutationFn: (variables: { employeeId: string; locationIds: Array<string> }) =>
      rehireEmployeeFn({ data: { ...input, ...variables } }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Employee rehired.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not rehire that employee.",
      })
    },
  })

  const compensationMutation = useMutation({
    mutationFn: (variables: {
      compensation: EmployeeCompensationInput
      employeeId: string
    }) => updateCompensationFn({ data: { ...input, ...variables } }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Pay rate updated.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that pay rate.",
      })
    },
  })

  const payrollIdMutation = useMutation({
    mutationFn: (variables: { employeeId: string; payrollId: string | null }) =>
      updatePayrollIdFn({ data: { ...input, ...variables } }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Payroll ID updated.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that payroll ID.",
      })
    },
  })

  const payrollImportMutation = useMutation({
    mutationFn: (variables: {
      updates: Array<{ employeeId: string; payrollId: string | null }>
    }) => bulkUpdatePayrollIdsFn({ data: { ...input, ...variables } }),
    onSuccess: async (updates) => {
      await invalidate()
      showSuccessToast(`${updates.length} payroll IDs updated.`)
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not import those payroll IDs.",
      })
    },
  })

  const createRotaNoteMutation = useMutation({
    mutationFn: (variables: RotaNoteMutationInput) =>
      createRotaNoteFn({ data: { ...input, ...variables } }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Note added.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not add that note.",
      })
    },
  })

  const updateRotaNoteMutation = useMutation({
    mutationFn: (variables: RotaNoteMutationInput & { noteId: string }) =>
      updateRotaNoteFn({ data: { ...input, ...variables } }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Note updated.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not update that note.",
      })
    },
  })

  const archiveRotaNoteMutation = useMutation({
    mutationFn: (variables: { employeeId: string; noteId: string }) =>
      archiveRotaNoteFn({ data: { ...input, ...variables } }),
    onSuccess: async () => {
      await invalidate()
      showSuccessToast("Note archived.")
    },
    onError: (error) => {
      showErrorToast(error, {
        fallbackMessage: "We could not archive that note.",
      })
    },
  })

  return {
    compensationMutation,
    archiveRotaNoteMutation,
    createRotaNoteMutation,
    locationActivityMutation,
    payrollIdMutation,
    payrollImportMutation,
    rehireEmployeeMutation,
    removeEmployeeMutation,
    roleMutation,
    updateRotaNoteMutation,
  }
}

export { useCompanyMutations }
