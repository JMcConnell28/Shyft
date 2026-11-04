import { z } from "zod"

const reconciliationSecretSchema = z
  .string()
  .min(32)
  .max(256)
  .regex(/^[A-Za-z0-9._~+=/-]+$/)
  .refine((value) => !/^(replace|your[-_])/i.test(value))
const reconciliationModeSchema = z.enum(["0", "1"]).nullable()

export { reconciliationModeSchema, reconciliationSecretSchema }
