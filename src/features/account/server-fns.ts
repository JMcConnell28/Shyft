import { createServerFn } from "@tanstack/react-start"

import {
  changeAccountPasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/features/account/schemas/account-schemas"

const changeAccountPassword = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => changeAccountPasswordSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/account/server/actions")
    return module.changeAccountPassword(data)
  })

const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => requestPasswordResetSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/account/server/actions")
    return module.requestPasswordReset(data)
  })

const resetPassword = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => resetPasswordSchema.parse(input))
  .handler(async ({ data }) => {
    const module = await import("@/features/account/server/actions")
    return module.resetPassword(data)
  })

export { changeAccountPassword, requestPasswordReset, resetPassword }
