import { z } from "zod"
import { flagKeySchema } from "../schemas/feature-flag-schemas"

const flagRowSchema = z.object({
  key: flagKeySchema,
  is_enabled: z.boolean(),
  default_value: z.boolean(),
  revision: z.number().int().nonnegative(),
  updated_at: z.date(),
  override_count: z.coerce.number().int().nonnegative(),
})
const locationFlagValueSchema = z.boolean().nullable().optional()

export { flagRowSchema, locationFlagValueSchema }
