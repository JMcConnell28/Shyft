import "@tanstack/react-start/server-only"

import type { ReactElement } from "react"
import { Resend } from "resend"

import { getOptionalEnv, getRequiredEnv } from "@/lib/env.server"

type SendEmailOptions = {
  to: string
  subject: string
  react: ReactElement
  text: string
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
}: SendEmailOptions) {
  const apiKey = getRequiredEnv("RESEND_API_KEY")
  const from =
    getOptionalEnv("RESEND_FROM_EMAIL") ?? "RocketRota <onboarding@resend.dev>"
  const resend = new Resend(apiKey)
  const recipient = getRecipient(to)

  if (isDevelopmentEmailMode()) {
    console.info(
      `Development email routed to ${recipient}. Original recipient: ${to}. Subject: ${subject}`,
    )
  }

  const { error } = await resend.emails.send({
    from,
    to: [recipient],
    subject,
    react,
    text,
  })

  if (error) {
    throw new Error(`Resend email delivery failed: ${error.message}`)
  }
}

export { sendTransactionalEmail }
