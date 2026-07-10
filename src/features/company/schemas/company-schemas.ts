import { z } from "zod"

import { assignableOrganizationRoles } from "@/lib/auth/permissions"
import { employeeCompensationSchema } from "@/features/staff-groups/schemas/staff-group-schemas"

const companyWorkspaceInputSchema = z
  .object({
    organizationId: z.string().trim().min(1).optional(),
    locationId: z.string().uuid().optional(),
    userId: z.string().trim().min(1),
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const companyEmployeeInputSchema = companyWorkspaceInputSchema.extend({
  employeeId: z.string().uuid("Choose a valid employee."),
})

const removeCompanyEmployeeInputSchema = companyEmployeeInputSchema

const rehireCompanyEmployeeInputSchema = companyEmployeeInputSchema
  .extend({
    locationIds: z
      .array(z.string().uuid("Choose valid locations."))
      .min(1, "Choose at least one location."),
  })
  .superRefine((value, context) => {
    if (new Set(value.locationIds).size !== value.locationIds.length) {
      context.addIssue({
        code: "custom",
        message: "Choose each location once.",
        path: ["locationIds"],
      })
    }
  })

const updateCompanyEmployeeRoleInputSchema = companyEmployeeInputSchema.extend({
  role: z.enum(assignableOrganizationRoles),
})

const updateCompanyEmployeeLocationInputSchema =
  companyEmployeeInputSchema.extend({
    targetLocationId: z.string().uuid("Choose a valid location."),
    isActive: z.boolean(),
  })

const updateCompanyEmployeeCompensationInputSchema =
  companyEmployeeInputSchema.extend({
    compensation: employeeCompensationSchema,
  })

const payrollIdSchema = z
  .string()
  .trim()
  .max(40, "Keep payroll IDs under 40 characters.")

const updateCompanyEmployeePayrollIdInputSchema =
  companyEmployeeInputSchema.extend({
    payrollId: payrollIdSchema.nullable(),
  })

const employeeRotaNoteCategorySchema = z.enum([
  "general",
  "skill",
  "constraint",
  "preference",
  "warning",
])

const employeeRotaNotePrioritySchema = z.enum(["low", "normal", "high"])

const employeeRotaNoteFieldsSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Add the note detail.")
    .max(1000, "Keep notes under 1,000 characters."),
  category: employeeRotaNoteCategorySchema,
  isPinned: z.boolean(),
  locationId: z.string().uuid("Choose a valid location.").nullable(),
  priority: employeeRotaNotePrioritySchema,
  title: z
    .string()
    .trim()
    .min(2, "Add a short note title.")
    .max(80, "Keep titles under 80 characters."),
  zoneId: z.string().uuid("Choose a valid zone.").nullable(),
})

const createCompanyEmployeeRotaNoteInputSchema =
  companyEmployeeInputSchema.extend({
    note: employeeRotaNoteFieldsSchema,
  })

const updateCompanyEmployeeRotaNoteInputSchema =
  companyEmployeeInputSchema.extend({
    note: employeeRotaNoteFieldsSchema,
    noteId: z.string().uuid("Choose a valid note."),
  })

const archiveCompanyEmployeeRotaNoteInputSchema =
  companyEmployeeInputSchema.extend({
    noteId: z.string().uuid("Choose a valid note."),
  })

const bulkUpdateCompanyEmployeePayrollIdsInputSchema =
  companyWorkspaceInputSchema.extend({
    updates: z
      .array(
        z.object({
          employeeId: z.string().uuid("Choose a valid employee."),
          payrollId: payrollIdSchema.nullable(),
        })
      )
      .min(1, "Choose at least one employee to update.")
      .max(500, "Import up to 500 employees at a time."),
  })

export {
  archiveCompanyEmployeeRotaNoteInputSchema,
  bulkUpdateCompanyEmployeePayrollIdsInputSchema,
  companyEmployeeInputSchema,
  companyWorkspaceInputSchema,
  createCompanyEmployeeRotaNoteInputSchema,
  employeeRotaNoteCategorySchema,
  employeeRotaNotePrioritySchema,
  rehireCompanyEmployeeInputSchema,
  removeCompanyEmployeeInputSchema,
  updateCompanyEmployeeRotaNoteInputSchema,
  updateCompanyEmployeePayrollIdInputSchema,
  updateCompanyEmployeeCompensationInputSchema,
  updateCompanyEmployeeLocationInputSchema,
  updateCompanyEmployeeRoleInputSchema,
}
