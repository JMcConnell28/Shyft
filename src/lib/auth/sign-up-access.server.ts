import "@tanstack/react-start/server-only"

import { timingSafeEqual } from "node:crypto"
import { APIError } from "better-auth/api"

import { signUpAccessCodeSchema } from "@/lib/auth/sign-up-access-schema"
import { getOptionalEnv } from "@/lib/env.server"

function requireSignUpAccessCode(value: unknown): void {
  const providedCode = signUpAccessCodeSchema.safeParse(value)
  const configuredCode = signUpAccessCodeSchema.safeParse(
    getOptionalEnv("SIGNUP_ACCESS_CODE")
  )

  // A missing or malformed deployment secret must never open beta admission.
  if (!configuredCode.success) {
    throw new APIError("SERVICE_UNAVAILABLE", {
      message: "Sign-up is temporarily unavailable. Please contact support.",
    })
  }

  if (
    !providedCode.success ||
    !timingSafeEqual(
      Buffer.from(providedCode.data),
      Buffer.from(configuredCode.data)
    )
  ) {
    throw new APIError("FORBIDDEN", {
      message: "The access code is incorrect.",
    })
  }
}

export { requireSignUpAccessCode }
