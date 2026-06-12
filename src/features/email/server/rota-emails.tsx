import "@tanstack/react-start/server-only"

import { RotaPublishedEmail } from "@/features/email/templates/rota-published"
import type { RotaPublishedShift } from "@/features/email/templates/rota-published"
import { sendTransactionalEmail } from "@/lib/email"

type SendRotaPublishedEmailInput = {
  locationName: string
  rotaUrl: string
  shifts: RotaPublishedShift[]
  to: string
  userName: string
  weekLabel: string
}

async function sendRotaPublishedEmail(input: SendRotaPublishedEmailInput) {
  await sendTransactionalEmail({
    to: input.to,
    subject: `${input.locationName} rota published for ${input.weekLabel}`,
    react: (
      <RotaPublishedEmail
        locationName={input.locationName}
        rotaUrl={input.rotaUrl}
        shifts={input.shifts}
        userName={input.userName}
        weekLabel={input.weekLabel}
      />
    ),
    text: `The ${input.locationName} rota for ${input.weekLabel} is now live. View it here: ${input.rotaUrl}`,
  })
}

export { sendRotaPublishedEmail }
