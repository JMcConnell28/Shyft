import {
  Button,
  Heading,
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components"

import type { RotaPublishedShift } from "@/features/email/types/rota-published"
import { BrandedEmailLayout } from "@/features/email/templates/branded-email-layout"
import {
  button,
  divider,
  footerLink,
  footerText,
} from "@/features/email/templates/branded-email-styles"
import { appName } from "@/features/email/templates/email-styles"
import {
  content,
  heading,
  message,
  noteText,
  noteTitle,
} from "@/features/email/templates/rota-published-styles"
import { RotaPublishedSummary } from "@/features/email/templates/rota-published-summary"
import { RotaPublishedTable } from "@/features/email/templates/rota-published-table"
import {
  formatRotaPublishedHours,
  formatRotaPublishedWeek,
} from "@/features/email/utils/rota-published-schedule"

type RotaPublishedEmailProps = {
  brandLogoUrl: string
  helpUrl: string
  locationName: string
  rotaUrl: string
  shifts: Array<RotaPublishedShift>
  shiftSwapsEnabled: boolean
  weekStart: string
}

function RotaPublishedEmail({
  brandLogoUrl,
  helpUrl,
  locationName,
  rotaUrl,
  shifts,
  shiftSwapsEnabled,
  weekStart,
}: RotaPublishedEmailProps) {
  const weekLabel = formatRotaPublishedWeek(weekStart)
  const totalMinutes = shifts.reduce(
    (total, shift) => total + shift.durationMinutes,
    0
  )

  return (
    <BrandedEmailLayout
      brandLogoUrl={brandLogoUrl}
      preview={`${locationName} rota published for ${weekLabel}`}
    >
      <Section style={content}>
        <Heading as="h1" style={heading}>
          Your rota has been published
        </Heading>
        <Text style={message}>
          Your shifts for {weekLabel} are ready to view. Open {appName} to see
          your full rota and get ready for the week ahead.
        </Text>

        <RotaPublishedSummary
          locationName={locationName}
          totalHours={formatRotaPublishedHours(totalMinutes)}
          weekLabel={weekLabel}
        />
        <RotaPublishedTable shifts={shifts} weekStart={weekStart} />

        <Button href={rotaUrl} style={button}>
          View rota&nbsp;&nbsp;→
        </Button>

        {shiftSwapsEnabled ? (
          <>
            <Hr style={{ ...divider, margin: "24px 0 18px" }} />
            <Text style={noteTitle}>
              Need to swap or can&apos;t work a shift?
            </Text>
            <Text style={noteText}>Open {appName} to check your options.</Text>
          </>
        ) : null}

        <Hr style={{ ...divider, margin: "24px 0 18px" }} />
        <Text style={footerText}>
          Need help?{" "}
          <Link href={helpUrl} style={footerLink}>
            Visit the Help Centre.
          </Link>
        </Text>
        <Text style={{ ...footerText, marginBottom: "0" }}>
          © {new Date().getFullYear()} {appName}. All rights reserved.
        </Text>
      </Section>
    </BrandedEmailLayout>
  )
}

export { RotaPublishedEmail }
