import "@tanstack/react-start/server-only"

import type { ReactElement } from "react"

import { getOptionalEnv, getRequiredEnv } from "@/lib/env.server"
import { deliverEmail } from "@/features/email/server/delivery"
import { renderEmailHtml } from "@/features/email/server/render"

type SendEmailOptions = {
  to: string
  subject: string
  react: ReactElement
  text: string
  idempotencyKey?: string
}

const resendDevelopmentRecipient = "delivered@resend.dev"

function getRecipient(to: string) {
  const configuredTestRecipient = getOptionalEnv("RESEND_TEST_TO_EMAIL")

  if (configuredTestRecipient) {
    return configuredTestRecipient
  }

  if (process.env.NODE_ENV !== "production") {
    return resendDevelopmentRecipient
  }

  return to
}

function isDevelopmentEmailMode() {
  return process.env.NODE_ENV !== "production"
}

async function sendTransactionalEmail({
  to,
  subject,
  react,
  text,
  idempotencyKey,
}: SendEmailOptions) {
  const apiKey = getRequiredEnv("RESEND_API_KEY")
  const from =
    getOptionalEnv("RESEND_FROM_EMAIL") ?? "RocketRota <onboarding@resend.dev>"
  const recipient = getRecipient(to)

  if (isDevelopmentEmailMode()) {
    console.info(
      `Development email routed to ${recipient}. Original recipient: ${to}. Subject: ${subject}`
    )
  }

  await deliverEmail({
    apiKey,
    from,
    to: recipient,
    subject,
    html: renderEmailHtml(react),
    text,
    idempotencyKey,
  })
}

export { sendTransactionalEmail }
