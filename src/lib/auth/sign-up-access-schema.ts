import { z } from "zod"

const signUpAccessCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the six-digit access code.")

export { signUpAccessCodeSchema }
