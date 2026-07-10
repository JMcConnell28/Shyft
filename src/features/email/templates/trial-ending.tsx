import { Button, Heading, Text } from "@react-email/components"

import { AuthEmailLayout } from "@/features/email/templates/auth-email-layout"
import {
  appName,
  button,
  heading,
  mutedBox,
  text,
} from "@/features/email/templates/email-styles"

type TrialEndingEmailProps = {
  billingUrl: string
  trialEndsLabel: string
  userName: string
  workspaceName: string
}

function TrialEndingEmail({
  billingUrl,
  trialEndsLabel,
  userName,
  workspaceName,
}: TrialEndingEmailProps) {
  return (
    <AuthEmailLayout preview={`${workspaceName} trial ends ${trialEndsLabel}`}>
      <Heading as="h1" style={heading}>
        Your trial is ending soon
      </Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        The {appName} trial for {workspaceName} ends {trialEndsLabel}.
      </Text>
      <div style={mutedBox}>
        <Text style={{ ...text, margin: 0 }}>
          Add or confirm a payment method before then so managers and staff keep
          access to rotas without interruption.
        </Text>
      </div>
      <Button href={billingUrl} style={{ ...button, marginTop: "22px" }}>
        Review billing
      </Button>
    </AuthEmailLayout>
  )
}

export { TrialEndingEmail }
