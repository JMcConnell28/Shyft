import { Button, Heading, Text } from "@react-email/components"

import { AuthEmailLayout } from "@/features/email/templates/auth-email-layout"
import {
  appName,
  button,
  heading,
  mutedBox,
  text,
} from "@/features/email/templates/email-styles"

type RotaPublishedShift = {
  dayLabel: string
  timeLabel: string
  zoneName: string | null
}

type RotaPublishedEmailProps = {
  locationName: string
  rotaUrl: string
  shifts: RotaPublishedShift[]
  userName: string
  weekLabel: string
}

const shiftText = {
  ...text,
  margin: "0 0 8px",
}

function RotaPublishedEmail({
  locationName,
  rotaUrl,
  shifts,
  userName,
  weekLabel,
}: RotaPublishedEmailProps) {
  return (
    <AuthEmailLayout preview={`${locationName} rota published for ${weekLabel}`}>
      <Heading as="h1" style={heading}>
        Your rota has been published
      </Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        The {locationName} rota for {weekLabel} is now live in {appName}.
      </Text>
      {shifts.length > 0 ? (
        <div style={mutedBox}>
          {shifts.slice(0, 6).map((shift) => (
            <Text
              key={`${shift.dayLabel}-${shift.timeLabel}-${shift.zoneName ?? "shift"}`}
              style={shiftText}
            >
              {shift.dayLabel}: {shift.timeLabel}
              {shift.zoneName ? `, ${shift.zoneName}` : ""}
            </Text>
          ))}
          {shifts.length > 6 ? (
            <Text style={{ ...shiftText, marginBottom: 0 }}>
              Plus {shifts.length - 6} more shift
              {shifts.length - 6 === 1 ? "" : "s"}.
            </Text>
          ) : null}
        </div>
      ) : null}
      <Button href={rotaUrl} style={{ ...button, marginTop: "22px" }}>
        View rota
      </Button>
    </AuthEmailLayout>
  )
}

export { RotaPublishedEmail }
export type { RotaPublishedShift }
