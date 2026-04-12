import { getOptionalEnv, getRequiredEnv } from "@/lib/env"

type SendEmailOptions = {
  to: string
  subject: string
  html: string
  text: string
}

async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions) {
  const apiKey = getRequiredEnv("RESEND_API_KEY")
  const from = getOptionalEnv("RESEND_FROM_EMAIL") ?? "Shyft <hello@shyft.local>"

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `Resend email delivery failed with ${response.status}: ${errorBody}`,
    )
  }
}

export { sendTransactionalEmail }
