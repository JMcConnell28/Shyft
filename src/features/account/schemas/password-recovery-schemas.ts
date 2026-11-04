import { z } from "zod"

import { emailSchema, passwordSchema } from "@/lib/onboarding-schemas"

const recoveryTokenSchema = z
  .string()
  .trim()
  .min(1, "Reset link is missing a token.")
  .max(512)
const recoveryRequestBodySchema = z.object({
  email: emailSchema.max(254),
  redirectTo: z.string().max(2048).optional(),
})
const recoveryResetBodySchema = z.object({
  token: recoveryTokenSchema,
  newPassword: passwordSchema,
})
const recoveryCounterSchema = z.object({
  allowed: z.boolean(),
  retry_after: z.number().int().positive(),
})
const recoveryRequestAddressSchema = z.object({
  ip: z.string().optional(),
  context: z.object({ clientAddress: z.string().optional() }).optional(),
})

export {
  recoveryCounterSchema,
  recoveryRequestAddressSchema,
  recoveryRequestBodySchema,
  recoveryResetBodySchema,
}
