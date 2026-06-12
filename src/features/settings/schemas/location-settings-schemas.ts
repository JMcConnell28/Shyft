import { z } from "zod"

import { shiftTimePattern } from "@/features/rota/utils/shift-time"

const organizationScopedUserSchema = z.object({
  organizationId: z.string().trim().min(1, "Choose an organization.").optional(),
  locationId: z.uuid().optional(),
  userId: z.string().trim().min(1, "Choose a user."),
})

const estimatedClosingTimeSchema = z
  .string()
  .regex(shiftTimePattern, "Choose a valid closing estimate.")

const getLocationSettingsInputSchema = organizationScopedUserSchema

const updateLocationSettingsInputSchema = organizationScopedUserSchema.extend({
  locationId: z.string().uuid("Choose a valid location."),
  estimatedClosingTime: estimatedClosingTimeSchema,
  estimatedClosingTimeNextDay: z.boolean(),
  daySettings: z.array(
    z.object({
      weekday: z.number().int().min(1).max(7),
      closeTime: estimatedClosingTimeSchema,
      closeTimeNextDay: z.boolean(),
    }),
  ),
})

export {
  getLocationSettingsInputSchema,
  updateLocationSettingsInputSchema,
}
