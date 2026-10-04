import type { z } from "zod"

import type {
  changeAccountPasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/features/account/schemas/account-schemas"
import { auth } from "@/lib/auth"
import { getAuthRequestHeaders } from "@/lib/auth-session.server"
import { ensureSession } from "@/lib/auth-server"

type ChangeAccountPasswordInput = z.infer<typeof changeAccountPasswordSchema>
type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

async function changeAccountPassword(input: ChangeAccountPasswordInput) {
  await ensureSession()
  const headers = getAuthRequestHeaders()

  await auth.api.changePassword({
    headers,
    body: {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
      revokeOtherSessions: true,
    },
  })

  return { success: true }
}

async function requestPasswordReset(input: RequestPasswordResetInput) {
  await auth.api.requestPasswordReset({
    body: {
      email: input.email,
      redirectTo: input.redirectTo,
    },
  })

  return { success: true }
}

async function resetPassword(input: ResetPasswordInput) {
  await auth.api.resetPassword({
    body: {
      newPassword: input.newPassword,
      token: input.token,
    },
  })

  return { success: true }
}

export { changeAccountPassword, requestPasswordReset, resetPassword }
