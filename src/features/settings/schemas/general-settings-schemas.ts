import { z } from "zod"

import { shiftTimePattern } from "@/features/rota/utils/shift-time"

const organizationScopedUserSchema = z.object({
  organizationId: z.string().trim().min(1, "Choose an organization."),
  userId: z.string().trim().min(1, "Choose a user."),
})

const estimatedClosingTimeSchema = z
  .string()
  .regex(shiftTimePattern, "Choose a valid closing estimate.")

const getGeneralSettingsInputSchema = organizationScopedUserSchema

const updateGeneralSettingsInputSchema = organizationScopedUserSchema.extend({
  estimatedClosingTime: estimatedClosingTimeSchema,
})

export {
  estimatedClosingTimeSchema,
  getGeneralSettingsInputSchema,
  updateGeneralSettingsInputSchema,
}
