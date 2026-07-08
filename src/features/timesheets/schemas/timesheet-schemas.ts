import { z } from "zod"

const weekStartSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid week.")
  .optional()
  .nullable()

const timesheetScopeBaseSchema = z.object({
  organizationId: z.string().trim().min(1).nullable().optional(),
  locationId: z.uuid().optional(),
  userId: z.string().trim().min(1, "Choose a user."),
  weekStart: weekStartSchema,
})

const timesheetScopeSchema = timesheetScopeBaseSchema.refine(
  (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
  "Choose either an organization or a location."
)

const editableDateTimeSchema = z
  .string()
  .trim()
  .refine((value) => Number.isFinite(Date.parse(value)), "Choose a valid time.")

const clockEntryStatusSchema = z.enum(["open", "closed", "requires_review"])

const updateTimesheetEntryInputSchema = timesheetScopeBaseSchema
  .extend({
    entryId: z.uuid("Choose a valid time entry."),
    clockedInAt: editableDateTimeSchema,
    clockedOutAt: editableDateTimeSchema.nullable(),
    payableStartAt: editableDateTimeSchema,
    payableEndAt: editableDateTimeSchema.nullable(),
    status: clockEntryStatusSchema,
    reason: z
      .string()
      .trim()
      .min(5, "Add a reason for the edit.")
      .max(300, "Keep the reason under 300 characters."),
  })
  .refine(
    (value) => Boolean(value.organizationId) || Boolean(value.locationId),
    "Choose a workspace."
  )
  .refine(
    (value) =>
      !value.clockedOutAt ||
      new Date(value.clockedOutAt).getTime() >=
        new Date(value.clockedInAt).getTime(),
    "Clock-out must be after clock-in."
  )
  .refine(
    (value) =>
      !value.payableEndAt ||
      new Date(value.payableEndAt).getTime() >=
        new Date(value.payableStartAt).getTime(),
    "Payable end must be after payable start."
  )
  .refine(
    (value) => (value.status === "open" ? value.clockedOutAt === null : true),
    "Open entries cannot have a clock-out time."
  )

const sageTimesheetExportInputSchema = timesheetScopeBaseSchema
  .extend({
    rotaId: z.uuid("Choose a valid rota."),
  })
  .refine(
    (value) => Boolean(value.organizationId) || Boolean(value.locationId),
    "Choose a workspace."
  )

export {
  sageTimesheetExportInputSchema,
  timesheetScopeSchema,
  updateTimesheetEntryInputSchema,
  weekStartSchema,
}
