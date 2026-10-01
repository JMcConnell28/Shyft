import { z } from "zod"

const termsAcceptanceSchema = z.literal(true, {
  error: "You must agree to the Terms and Conditions to continue.",
})

export { termsAcceptanceSchema }
