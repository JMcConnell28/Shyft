import { z } from "zod"

import { emailSchema, passwordSchema } from "@/lib/onboarding-schemas"

const updateAccountProfileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(120),
})

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
  email: emailSchema,
  redirectTo: z.string().optional(),
})

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Reset link is missing a token."),
    newPassword: passwordSchema,
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
  updateAccountProfileSchema,
}
