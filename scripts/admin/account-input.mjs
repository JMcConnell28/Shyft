import { z } from "zod"

const operatorAccountInput = z.object({
  email: z
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  operator: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(120).optional(),
  role: z
    .enum(["owner", "developer", "support", "readonly"])
    .default("readonly"),
})
const operatorPasswordInput = z.string().min(16).max(128)

export { operatorAccountInput, operatorPasswordInput }
