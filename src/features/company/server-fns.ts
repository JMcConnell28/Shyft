import { createServerFn } from "@tanstack/react-start"
import { requireWorkspaceWriteAccess } from "@/features/billing/server/workspace-write-access"

import {
  archiveCompanyEmployeeRotaNoteInputSchema,
  bulkUpdateCompanyEmployeePayrollIdsInputSchema,
  companyEmployeeInputSchema,
  companyWorkspaceInputSchema,
  createCompanyEmployeeRotaNoteInputSchema,
  rehireCompanyEmployeeInputSchema,
  removeCompanyEmployeeInputSchema,
  updateCompanyEmployeeCompensationInputSchema,
  updateCompanyEmployeeLocationInputSchema,
  updateCompanyEmployeePayrollIdInputSchema,
  updateCompanyEmployeeRoleInputSchema,
  updateCompanyEmployeeRotaNoteInputSchema,
  updateCompanyEmployeeRotaVisibilityInputSchema,
} from "@/features/company/schemas/company-schemas"

const getCompanyEmployeesPageData = createServerFn({ method: "POST" })
  .validator((input: unknown) => companyWorkspaceInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/queries")
    return module.getCompanyEmployeesPageData(data)
  })

const getSageEmployeeImportAvailability = createServerFn({ method: "POST" })
  .validator((input: unknown) => companyWorkspaceInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { requireCompanyAdminContext } = await import("./server/shared")
    const context = await requireCompanyAdminContext(data)
    const { canImportSageEmployees } =
      await import("./server/sage-import-access")
    return canImportSageEmployees(context)
  })

const getCompanyEmployeePageData = createServerFn({ method: "POST" })
  .validator((input: unknown) => companyEmployeeInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/queries")
    return module.getCompanyEmployeePageData(data)
  })

const updateCompanyEmployeeRole = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    updateCompanyEmployeeRoleInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeeRole(data)
  })

const updateCompanyEmployeeLocationActivity = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    updateCompanyEmployeeLocationInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeeLocationActivity(data)
  })

const updateCompanyEmployeeRotaVisibility = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    updateCompanyEmployeeRotaVisibilityInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeeRotaVisibility(data)
  })

const removeCompanyEmployee = createServerFn({ method: "POST" })
  .validator((input: unknown) => removeCompanyEmployeeInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.removeCompanyEmployee(data)
  })

const rehireCompanyEmployee = createServerFn({ method: "POST" })
  .validator((input: unknown) => rehireCompanyEmployeeInputSchema.parse(input))
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.rehireCompanyEmployee(data)
  })

const updateCompanyEmployeeCompensation = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    updateCompanyEmployeeCompensationInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeeCompensation(data)
  })

const updateCompanyEmployeePayrollId = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    updateCompanyEmployeePayrollIdInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeePayrollId(data)
  })

const createCompanyEmployeeRotaNote = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    createCompanyEmployeeRotaNoteInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.createCompanyEmployeeRotaNote(data)
  })

const updateCompanyEmployeeRotaNote = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    updateCompanyEmployeeRotaNoteInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeeRotaNote(data)
  })

const archiveCompanyEmployeeRotaNote = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    archiveCompanyEmployeeRotaNoteInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.archiveCompanyEmployeeRotaNote(data)
  })

const bulkUpdateCompanyEmployeePayrollIds = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    bulkUpdateCompanyEmployeePayrollIdsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    await requireWorkspaceWriteAccess(data)
    const module = await import("@/features/company/server/actions")
    return module.bulkUpdateCompanyEmployeePayrollIds(data)
  })

export {
  archiveCompanyEmployeeRotaNote,
  bulkUpdateCompanyEmployeePayrollIds,
  createCompanyEmployeeRotaNote,
  getCompanyEmployeePageData,
  getCompanyEmployeesPageData,
  getSageEmployeeImportAvailability,
  rehireCompanyEmployee,
  removeCompanyEmployee,
  updateCompanyEmployeeCompensation,
  updateCompanyEmployeeLocationActivity,
  updateCompanyEmployeeRotaVisibility,
  updateCompanyEmployeePayrollId,
  updateCompanyEmployeeRotaNote,
  updateCompanyEmployeeRole,
}
