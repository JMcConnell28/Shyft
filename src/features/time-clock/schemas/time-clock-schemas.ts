import { z } from "zod"

const clockTokenSchema = z
  .string()
  .trim()
  .min(24, "Choose a valid clock tag.")
  .max(256, "Choose a valid clock tag.")

const workspaceClockScopeBaseSchema = z.object({
    organizationId: z.string().trim().min(1).optional(),
    locationId: z.uuid().optional(),
    userId: z.string().trim().min(1, "Choose a user."),
  })

const workspaceClockScopeSchema = workspaceClockScopeBaseSchema
  .refine(
    (value) => Boolean(value.organizationId) !== Boolean(value.locationId),
    "Choose either an organization or a location.",
  )

const gpsCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().positive().max(5000),
})

const clockActionSchema = z.enum(["clock_in", "clock_out"])
const clockShiftSegmentSchema = z.enum(["full", "split_first", "split_second"])

const getEmployeeClockPageInputSchema = z.object({
  token: clockTokenSchema,
  userId: z.string().trim().min(1, "Choose a user."),
})

const submitEmployeeClockInputSchema = getEmployeeClockPageInputSchema.extend({
  action: clockActionSchema,
  gps: gpsCoordinatesSchema.nullish(),
  shiftSegment: clockShiftSegmentSchema.optional(),
})

const getManagerClockPageInputSchema = workspaceClockScopeSchema

const managerClockOverrideInputSchema = workspaceClockScopeBaseSchema.extend({
  employeeId: z.uuid("Choose a valid team member."),
  locationId: z.uuid("Choose a valid location."),
  action: clockActionSchema,
  reason: z
    .string()
    .trim()
    .min(5, "Add a reason for the override.")
    .max(300, "Keep the reason under 300 characters."),
}).refine(
  (value) => Boolean(value.organizationId) || Boolean(value.locationId),
  "Choose a workspace.",
)

const getClockSettingsPageInputSchema = workspaceClockScopeSchema

const updateClockSettingsInputSchema = workspaceClockScopeBaseSchema.extend({
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
  lateClockOutGraceMinutes: z.number().int().min(0).max(120),
  lateFinishReviewMinutes: z.number().int().min(0).max(240),
}).refine(
  (value) => Boolean(value.organizationId) || Boolean(value.locationId),
  "Choose a workspace.",
)

export {
  clockActionSchema,
  clockShiftSegmentSchema,
  clockTokenSchema,
  getClockSettingsPageInputSchema,
  getEmployeeClockPageInputSchema,
  getManagerClockPageInputSchema,
  gpsCoordinatesSchema,
  managerClockOverrideInputSchema,
  submitEmployeeClockInputSchema,
  updateClockSettingsInputSchema,
  workspaceClockScopeSchema,
}
