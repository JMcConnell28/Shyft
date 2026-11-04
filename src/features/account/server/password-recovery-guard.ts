import "@tanstack/react-start/server-only"

import { createHmac } from "node:crypto"
import { APIError } from "better-auth/api"

import {
  passwordRecoveryLimits,
  recoveryWindowSeconds,
} from "@/features/account/constants/password-recovery-limits"
import {
  recoveryRequestBodySchema,
  recoveryResetBodySchema,
} from "@/features/account/schemas/password-recovery-schemas"
import { consumeRecoveryLimit } from "@/features/account/server/recovery-limit-store"
import { getRecoverySource } from "@/features/account/server/recovery-source"
import { getOptionalEnv, getRequiredEnv } from "@/lib/env.server"

type RecoveryContext = { path: string; body: unknown; request?: Request }
type RecoveryOperation = keyof typeof passwordRecoveryLimits

async function enforceLimit(
  operation: RecoveryOperation,
  scope: string,
  identity: string,
  max: number
): Promise<void> {
  const hash = createHmac("sha256", getRequiredEnv("BETTER_AUTH_SECRET"))
    .update(JSON.stringify(["password-recovery", operation, scope, identity]))
    .digest("hex")
  let result
  try {
    result = await consumeRecoveryLimit(hash, max, recoveryWindowSeconds)
  } catch {
    throw new APIError("SERVICE_UNAVAILABLE", {
      message:
        "Password recovery is temporarily unavailable. Please try again later.",
    })
  }
  if (!result.allowed) {
    throw new APIError(
      "TOO_MANY_REQUESTS",
      { message: "Too many recovery attempts. Please try again later." },
      {
        "Retry-After": String(result.retryAfter),
      }
    )
  }
}

async function guardPasswordRecovery(
  ctx: RecoveryContext,
  isTrustedOrigin: (origin: string) => boolean
): Promise<Record<string, unknown> | undefined> {
  if (ctx.path !== "/request-password-reset" && ctx.path !== "/reset-password")
    return undefined
  if (!ctx.request)
    throw new APIError("BAD_REQUEST", {
      message: "A recovery request context is required.",
    })
  const headers = ctx.request.headers
  const origin = headers.get("origin") ?? headers.get("referer")
  if (
    (origin && !isTrustedOrigin(origin)) ||
    (!origin &&
      (headers.has("cookie") || headers.get("sec-fetch-site") === "cross-site"))
  ) {
    throw new APIError("FORBIDDEN", {
      message: "Invalid recovery request origin.",
    })
  }
  const operation = ctx.path === "/request-password-reset" ? "request" : "reset"
  const limits = passwordRecoveryLimits[operation]
  // Consume the global budget before allocating attacker-selected identity keys.
  await enforceLimit(operation, "global", "all", limits.global)
  const source = getRecoverySource(ctx.request)
  await enforceLimit(
    operation,
    "source",
    source ?? "unknown",
    source ? limits.source : limits.unknownSource
  )

  if (operation === "request") {
    const parsed = recoveryRequestBodySchema.safeParse(ctx.body)
    if (!parsed.success)
      throw new APIError("BAD_REQUEST", {
        message: "Invalid recovery request.",
      })
    const callback = new URL(
      "/reset-password",
      getOptionalEnv("BETTER_AUTH_URL") ?? "http://localhost:3000"
    ).href
    if (
      parsed.data.redirectTo &&
      parsed.data.redirectTo !== "/reset-password" &&
      parsed.data.redirectTo !== callback
    ) {
      throw new APIError("BAD_REQUEST", {
        message: "Invalid recovery destination.",
      })
    }
    const email = parsed.data.email.toLowerCase()
    await enforceLimit(operation, "target", email, limits.target)
    return { email, redirectTo: callback }
  }

  const parsed = recoveryResetBodySchema.safeParse(ctx.body)
  if (!parsed.success)
    throw new APIError("BAD_REQUEST", { message: "Invalid recovery request." })
  await enforceLimit(operation, "target", parsed.data.token, limits.target)
  return parsed.data
}

export { guardPasswordRecovery }
