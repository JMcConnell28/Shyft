import "@tanstack/react-start/server-only"

import { emailDeliveryResultSchema } from "@/features/email/schemas/delivery-schemas"

type EmailDeliveryInput = {
  apiKey: string
  from: string
  to: string
  subject: string
  html: string
  text: string
  idempotencyKey?: string
}

async function deliverEmail({
  apiKey,
  idempotencyKey,
  to,
  ...message
}: EmailDeliveryInput): Promise<void> {
  const headers = new Headers({
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  })
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey)
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...message, to: [to] }),
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    })
    if (!response.ok) throw new Error("Email provider rejected delivery")
    emailDeliveryResultSchema.parse(await response.json())
  } catch {
    // Provider responses and network errors can contain recipient or request data.
    throw new Error("Email delivery failed. Please try again.")
  }
}

export { deliverEmail }
