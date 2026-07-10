import { z } from "zod"

import {
  onboardingBusinessTypeSchema,
  onboardingPlanningModeSchema,
} from "@/features/onboarding/schemas/onboarding-schemas"
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

const createLocationInputSchema = organizationScopedUserSchema.extend({
  organizationId: z.string().trim().min(1, "Choose an organization."),
  name: z
    .string()
    .trim()
    .min(2, "Enter a location name.")
    .max(80, "Location name is too long."),
  businessType: onboardingBusinessTypeSchema,
  planningMode: onboardingPlanningModeSchema,
  zoneNames: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Enter a zone name.")
        .max(80, "Zone name is too long.")
    )
    .max(12, "Use 12 zones or fewer.")
    .default([]),
  worksiteName: z
    .string()
    .trim()
    .max(80, "Worksite name is too long.")
    .optional()
    .default(""),
})

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
  createLocationInputSchema,
  getLocationSettingsInputSchema,
  updateLocationSettingsInputSchema,
}
