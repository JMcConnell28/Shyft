import { z } from "zod"
import { featureFlagDefinitions } from "@rocketrota/shared/feature-flags"

const featureFlagKeySchema = z.enum(
  featureFlagDefinitions.map((flag) => flag.key)
)
const featureFlagLocationSchema = z.object({ locationId: z.uuid() })
const featureFlagRowSchema = z.object({
  key: featureFlagKeySchema,
  is_enabled: z.boolean(),
  default_value: z.boolean(),
  location_value: z.boolean().nullable(),
})
export { featureFlagKeySchema, featureFlagLocationSchema, featureFlagRowSchema }
