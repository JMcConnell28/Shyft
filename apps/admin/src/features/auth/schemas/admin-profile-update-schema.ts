import { z } from "zod"

const protectedProfileFields = ["role", "disabledAt", "disabled_at"] as const

const adminProfileUpdateSchema = z
  .record(z.string(), z.unknown())
  .refine((body) =>
    protectedProfileFields.every((field) => !Object.hasOwn(body, field))
  )

export { adminProfileUpdateSchema }
