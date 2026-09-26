import "@tanstack/react-start/server-only"

import type { RotaPublishedShift } from "@/features/email/types/rota-published"
import { getBrandedEmailLogoUrl } from "@/features/email/server/email-assets"
import { RotaPublishedEmail } from "@/features/email/templates/rota-published"
import {
  buildRotaPublishedDays,
  formatRotaPublishedHours,
  formatRotaPublishedWeek,
} from "@/features/email/utils/rota-published-schedule"
import { sendTransactionalEmail } from "@/lib/email"

type SendRotaPublishedEmailInput = {
  locationName: string
  rotaUrl: string
  shifts: Array<RotaPublishedShift>
  shiftSwapsEnabled: boolean
  to: string
  weekStart: string
}

async function sendRotaPublishedEmail(input: SendRotaPublishedEmailInput) {
  const weekLabel = formatRotaPublishedWeek(input.weekStart)
  const totalMinutes = input.shifts.reduce(
    (total, shift) => total + shift.durationMinutes,
    0
  )
  const schedule = buildRotaPublishedDays(input.weekStart, input.shifts)
    .flatMap((day) =>
      day.shifts.length === 0
        ? [`${day.label}: Off`]
        : day.shifts.map(
            (shift) =>
              `${day.label}: ${shift.zoneName ?? "Shift"}, ${shift.timeLabel} (${formatRotaPublishedHours(shift.durationMinutes)}h)`
          )
    )
    .join("\n")

  await sendTransactionalEmail({
    to: input.to,
    subject: `${input.locationName} rota published for ${weekLabel}`,
    react: (
      <RotaPublishedEmail
        brandLogoUrl={getBrandedEmailLogoUrl()}
        helpUrl={new URL("/help", input.rotaUrl).toString()}
        locationName={input.locationName}
        rotaUrl={input.rotaUrl}
        shifts={input.shifts}
        shiftSwapsEnabled={input.shiftSwapsEnabled}
        weekStart={input.weekStart}
      />
    ),
    text: `Your rota has been published.\n\nLocation: ${input.locationName}\nWeek: ${weekLabel}\nTotal hours: ${formatRotaPublishedHours(totalMinutes)}\n\n${schedule}\n\nView rota: ${input.rotaUrl}`,
  })
}

export { sendRotaPublishedEmail }
