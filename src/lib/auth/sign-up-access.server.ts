import "@tanstack/react-start/server-only"

import { timingSafeEqual } from "node:crypto"
import { APIError } from "better-auth/api"

import { signUpAccessCodeSchema } from "@/lib/auth/sign-up-access-schema"
import { getOptionalEnv } from "@/lib/env.server"

const defaultSignUpAccessCode = "522562"

function requireSignUpAccessCode(value: unknown): void {
  const providedCode = signUpAccessCodeSchema.safeParse(value)
  const configuredCode = signUpAccessCodeSchema.parse(
    getOptionalEnv("SIGNUP_ACCESS_CODE") ?? defaultSignUpAccessCode
  )

  if (
    !providedCode.success ||
    !timingSafeEqual(
      Buffer.from(providedCode.data),
      Buffer.from(configuredCode)
    )
  ) {
    throw new APIError("FORBIDDEN", {
      message: "The access code is incorrect.",
    })
  }
}

export { requireSignUpAccessCode }
