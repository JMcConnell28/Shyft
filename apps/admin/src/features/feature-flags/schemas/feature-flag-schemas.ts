import { z } from "zod"

const featureFlagValueSchema = z.union([
  z.boolean(),
  z.string(),
  z.number(),
])

const createFeatureFlagSchema = z.object({
  defaultValue: featureFlagValueSchema.default(false),
  description: z.string().trim().max(500).optional(),
  key: z
    .string()
    .trim()
    .regex(/^[a-z0-9][a-z0-9._-]{1,80}$/),
  name: z.string().trim().min(2).max(120),
})

const updateFeatureFlagSchema = z.object({
  defaultValue: featureFlagValueSchema.optional(),
  description: z.string().trim().max(500).nullable().optional(),
  id: z.uuid(),
  isEnabled: z.boolean().optional(),
  name: z.string().trim().min(2).max(120).optional(),
})

export { createFeatureFlagSchema, updateFeatureFlagSchema }
