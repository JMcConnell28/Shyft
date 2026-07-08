import { createServerFn } from "@tanstack/react-start"

import {
  archiveCompanyEmployeeRotaNoteInputSchema,
  bulkUpdateCompanyEmployeePayrollIdsInputSchema,
  companyEmployeeInputSchema,
  companyWorkspaceInputSchema,
  createCompanyEmployeeRotaNoteInputSchema,
  updateCompanyEmployeeRotaNoteInputSchema,
  updateCompanyEmployeeCompensationInputSchema,
  updateCompanyEmployeeLocationInputSchema,
  updateCompanyEmployeePayrollIdInputSchema,
  updateCompanyEmployeeRoleInputSchema,
} from "@/features/company/schemas/company-schemas"

const getCompanyEmployeesPageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => companyWorkspaceInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/queries")
    return module.getCompanyEmployeesPageData(data)
  })

const getCompanyEmployeePageData = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => companyEmployeeInputSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/queries")
    return module.getCompanyEmployeePageData(data)
  })

const updateCompanyEmployeeRole = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateCompanyEmployeeRoleInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeeRole(data)
  })

const updateCompanyEmployeeLocationActivity = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateCompanyEmployeeLocationInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeeLocationActivity(data)
  })

const updateCompanyEmployeeCompensation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateCompanyEmployeeCompensationInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeeCompensation(data)
  })

const updateCompanyEmployeePayrollId = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateCompanyEmployeePayrollIdInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeePayrollId(data)
  })

const createCompanyEmployeeRotaNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    createCompanyEmployeeRotaNoteInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/actions")
    return module.createCompanyEmployeeRotaNote(data)
  })

const updateCompanyEmployeeRotaNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    updateCompanyEmployeeRotaNoteInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/actions")
    return module.updateCompanyEmployeeRotaNote(data)
  })

const archiveCompanyEmployeeRotaNote = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    archiveCompanyEmployeeRotaNoteInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/actions")
    return module.archiveCompanyEmployeeRotaNote(data)
  })

const bulkUpdateCompanyEmployeePayrollIds = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    bulkUpdateCompanyEmployeePayrollIdsInputSchema.parse(input)
  )
  .handler(async ({ data }) => {
    const module = await import("@/features/company/server/actions")
    return module.bulkUpdateCompanyEmployeePayrollIds(data)
  })

export {
  archiveCompanyEmployeeRotaNote,
  bulkUpdateCompanyEmployeePayrollIds,
  createCompanyEmployeeRotaNote,
  getCompanyEmployeePageData,
  getCompanyEmployeesPageData,
  updateCompanyEmployeeCompensation,
  updateCompanyEmployeeLocationActivity,
  updateCompanyEmployeePayrollId,
  updateCompanyEmployeeRotaNote,
  updateCompanyEmployeeRole,
}
