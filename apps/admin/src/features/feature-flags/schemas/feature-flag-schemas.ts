import { z } from "zod"
import { featureFlagDefinitions } from "@rocketrota/shared/feature-flags"

const flagKeySchema = z.enum(featureFlagDefinitions.map((flag) => flag.key))
const flagLocationSchema = z.object({ locationId: z.uuid() })
const flagDetailsSchema = z.object({
  key: flagKeySchema,
  search: z.string().trim().max(120).default(""),
  page: z.number().int().min(1).max(100000).default(1),
})
const flagChangeSchema = z.object({
  key: flagKeySchema,
  expectedRevision: z.number().int().nonnegative(),
  reason: z.string().trim().max(300).default(""),
})
const updateFeatureFlagSchema = flagChangeSchema.extend({
  mode: z.enum(["off", "selected", "all"]),
})
const updateLocationFlagSchema = flagChangeSchema.extend({
  locationId: z.uuid(),
  override: z.enum(["inherit", "enabled", "disabled"]),
})
export {
  flagKeySchema,
  flagLocationSchema,
  flagDetailsSchema,
  updateFeatureFlagSchema,
  updateLocationFlagSchema,
}
export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>
export type UpdateLocationFlagInput = z.infer<typeof updateLocationFlagSchema>
export type FlagDetailsInput = z.infer<typeof flagDetailsSchema>
