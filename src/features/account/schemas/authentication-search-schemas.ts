import { z } from "zod"

import { isSafeAppReturnPath } from "@/lib/app-return-path"

const authenticationSearchSchema = z.object({
  redirect: z.string().refine(isSafeAppReturnPath).catch("/dashboard"),
})
const verificationSearchSchema = authenticationSearchSchema.extend({
  email: z.string().catch(""),
  sent: z
    .union([z.literal("1"), z.literal(true)])
    .transform(() => true)
    .catch(false),
})

export { authenticationSearchSchema, verificationSearchSchema }
