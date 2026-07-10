import { z } from "zod"

const workspaceClockScopeBaseSchema = z.object({
  organizationId: z.string().trim().min(1).optional(),
  locationId: z.uuid().optional(),
  userId: z.string().trim().min(1, "Choose a user."),
})

const workspaceClockScopeSchema = workspaceClockScopeBaseSchema.refine(
  (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
  "Choose either an organization or a location."
)

const gpsCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().positive().max(5000),
})

const clockActionSchema = z.enum(["clock_in", "clock_out"])
const clockShiftSegmentSchema = z.enum(["full", "split_first", "split_second"])
const earlyClockInModeSchema = z.enum(["scheduled", "now"])
const clockReasonSchema = z.enum([
  "asked_early",
  "asked_late",
  "covering_shift",
  "transport_delay",
  "manager_approved",
  "other",
])

const getEmployeeClockPageInputSchema = z.object({
  scanSessionId: z.uuid("Choose a valid clock session."),
  userId: z.string().trim().min(1, "Choose a user."),
})

const submitEmployeeClockInputSchema = getEmployeeClockPageInputSchema.extend({
  action: clockActionSchema,
  earlyClockInMode: earlyClockInModeSchema.optional(),
  reason: clockReasonSchema.optional(),
  shiftSegment: clockShiftSegmentSchema.optional(),
})

const selectedClockDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
  .optional()

const getManagerClockPageInputSchema = workspaceClockScopeSchema.extend({
  date: selectedClockDateSchema,
})

const managerClockOverrideInputSchema = workspaceClockScopeBaseSchema
  .extend({
    employeeId: z.uuid("Choose a valid team member."),
    locationId: z.uuid("Choose a valid location."),
    action: clockActionSchema,
    reason: z
      .string()
      .trim()
      .min(5, "Add a reason for the override.")
      .max(300, "Keep the reason under 300 characters."),
  })
  .refine(
    (value) => Boolean(value.organizationId) || Boolean(value.locationId),
    "Choose a workspace."
  )

const approveTimeEntryAsRecordedInputSchema = workspaceClockScopeBaseSchema
  .extend({
    entryId: z.uuid("Choose a valid time entry."),
  })
  .refine(
    (value) => Boolean(value.organizationId) || Boolean(value.locationId),
    "Choose a workspace."
  )

const getClockSettingsPageInputSchema = workspaceClockScopeSchema

const adminUserInputSchema = z.object({
  userId: z.string().trim().min(1, "Choose a user."),
})

const generateAdminClockTagSetupInputSchema = adminUserInputSchema.extend({
  locationId: z.uuid("Choose a valid location."),
})

const updateClockSettingsInputSchema = workspaceClockScopeBaseSchema
  .extend({
    locationId: z.uuid("Choose a valid location."),
    isEnabled: z.boolean(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    radiusMeters: z.number().int().min(10).max(1000),
    maxAccuracyMeters: z.number().int().min(10).max(1000),
    timezone: z.string().trim().min(1).max(80),
    earlyClockInGraceMinutes: z.number().int().min(0).max(120),
    earlyStartReviewMinutes: z.number().int().min(0).max(240),
    forgottenClockOutAlertMinutes: z.number().int().min(15).max(1440),
    hardReviewAfterMinutes: z.number().int().min(60).max(2880),
    lateClockInGraceMinutes: z.number().int().min(0).max(120),
    lateClockOutGraceMinutes: z.number().int().min(0).max(120),
    lateFinishReviewMinutes: z.number().int().min(0).max(240),
    lateStartReviewMinutes: z.number().int().min(0).max(240),
  })
  .refine(
    (value) => Boolean(value.organizationId) || Boolean(value.locationId),
    "Choose a workspace."
  )

export {
  approveTimeEntryAsRecordedInputSchema,
  adminUserInputSchema,
  clockActionSchema,
  clockReasonSchema,
  clockShiftSegmentSchema,
  earlyClockInModeSchema,
  generateAdminClockTagSetupInputSchema,
  getClockSettingsPageInputSchema,
  getEmployeeClockPageInputSchema,
  getManagerClockPageInputSchema,
  gpsCoordinatesSchema,
  managerClockOverrideInputSchema,
  submitEmployeeClockInputSchema,
  updateClockSettingsInputSchema,
  workspaceClockScopeSchema,
}
