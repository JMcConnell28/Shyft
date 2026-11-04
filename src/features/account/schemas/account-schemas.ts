import { z } from "zod"

import { passwordSchema } from "@/lib/onboarding-schemas"
import {
  recoveryRequestBodySchema,
  recoveryResetBodySchema,
} from "@/features/account/schemas/password-recovery-schemas"

const changeAccountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

const requestPasswordResetSchema = z.object({
  email: recoveryRequestBodySchema.shape.email,
  redirectTo: z.literal("/reset-password").optional(),
})

const resetPasswordSchema = z
  .object({
    ...recoveryResetBodySchema.shape,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export {
  changeAccountPasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
}
