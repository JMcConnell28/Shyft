import { z } from "zod"

import { staffGroupColorOptions } from "@/features/staff-groups/constants/staff-group-colors"

const workspaceScopedUserSchema = z.object({
  organizationId: z
    .string()
    .trim()
    .min(1, "Choose an organization.")
    .optional(),
  locationId: z.string().uuid("Choose a valid location.").optional(),
  userId: z.string().trim().min(1, "Choose a user."),
})

const staffGroupNameSchema = z
  .string()
  .trim()
  .min(2, "Enter a group name.")
  .max(15, "Keep group names under 15 characters.")

const staffGroupColorSchema = z.enum(staffGroupColorOptions, {
  error: "Choose a valid group color.",
})

const getStaffGroupSettingsInputSchema = workspaceScopedUserSchema.refine(
  (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
  "Choose either an organization or a location."
)

const createStaffGroupInputSchema = workspaceScopedUserSchema
  .extend({
    name: staffGroupNameSchema,
    color: staffGroupColorSchema,
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const renameStaffGroupInputSchema = workspaceScopedUserSchema
  .extend({
    groupId: z.string().uuid("Choose a valid group."),
    name: staffGroupNameSchema,
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const setStaffGroupColorInputSchema = workspaceScopedUserSchema
  .extend({
    groupId: z.string().uuid("Choose a valid group."),
    color: staffGroupColorSchema,
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const deleteStaffGroupInputSchema = workspaceScopedUserSchema
  .extend({
    groupId: z.string().uuid("Choose a valid group."),
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const assignEmployeeStaffGroupInputSchema = workspaceScopedUserSchema
  .extend({
    employeeId: z.string().uuid("Choose a valid team member."),
    groupId: z.string().uuid("Choose a valid group."),
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const bulkAssignEmployeeStaffGroupInputSchema = workspaceScopedUserSchema
  .extend({
    employeeIds: z
      .array(z.string().uuid("Choose valid team members."))
      .min(1, "Choose at least one team member."),
    groupId: z.string().uuid("Choose a valid group."),
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const setEmployeeActiveInputSchema = workspaceScopedUserSchema
  .extend({
    employeeId: z.string().uuid("Choose a valid team member."),
    isActive: z.boolean(),
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const employeeCompensationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hourly"),
    hourlyRatePence: z
      .number()
      .int()
      .min(0, "Enter an hourly rate of zero or more.")
      .max(100_000, "Enter an hourly rate below £1,000."),
  }),
  z.object({
    type: z.literal("salary"),
    weeklySalaryPence: z
      .number()
      .int()
      .min(0, "Enter a weekly salary of zero or more.")
      .max(100_000_000, "Enter a weekly salary below £1,000,000."),
  }),
])

const setEmployeeCompensationInputSchema = workspaceScopedUserSchema
  .extend({
    employeeId: z.string().uuid("Choose a valid team member."),
    compensation: employeeCompensationSchema,
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const bulkSetEmployeeCompensationInputSchema = workspaceScopedUserSchema
  .extend({
    employeeIds: z
      .array(z.string().uuid("Choose valid team members."))
      .min(1, "Choose at least one team member."),
    compensation: employeeCompensationSchema,
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

const removeEmployeeFromWorkspaceInputSchema = workspaceScopedUserSchema
  .extend({
    employeeId: z.string().uuid("Choose a valid team member."),
  })
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location."
  )

export {
  assignEmployeeStaffGroupInputSchema,
  bulkSetEmployeeCompensationInputSchema,
  bulkAssignEmployeeStaffGroupInputSchema,
  createStaffGroupInputSchema,
  deleteStaffGroupInputSchema,
  employeeCompensationSchema,
  getStaffGroupSettingsInputSchema,
  renameStaffGroupInputSchema,
  removeEmployeeFromWorkspaceInputSchema,
  setEmployeeCompensationInputSchema,
  setEmployeeActiveInputSchema,
  setStaffGroupColorInputSchema,
}
