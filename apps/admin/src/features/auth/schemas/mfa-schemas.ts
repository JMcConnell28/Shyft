import { z } from "zod"

const mfaSetupSchema = z.object({
  method: z.literal("totp"),
  totpURI: z.string().startsWith("otpauth://totp/"),
  backupCodes: z.array(z.string().min(1)).min(1),
})

export { mfaSetupSchema }
