import { Button, Heading, Text } from "@react-email/components"

import { AuthEmailLayout } from "@/features/email/templates/auth-email-layout"
import {
  appName,
  button,
  heading,
  mutedBox,
  text,
} from "@/features/email/templates/email-styles"

type PaymentFailedEmailProps = {
  billingUrl: string
  userName: string
  workspaceName: string
}

function PaymentFailedEmail({
  billingUrl,
  userName,
  workspaceName,
}: PaymentFailedEmailProps) {
  return (
    <AuthEmailLayout preview={`Payment failed for ${workspaceName}`}>
      <Heading as="h1" style={heading}>
        Payment failed
      </Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        Stripe could not collect the latest payment for {workspaceName}. Please
        update the billing details to keep {appName} active for your team.
      </Text>
      <div style={mutedBox}>
        <Text style={{ ...text, margin: 0 }}>
          Stripe will continue handling retries, invoices, and payment method
          collection. This email is from {appName} so the right workspace owner
          knows action is needed.
        </Text>
      </div>
      <Button href={billingUrl} style={{ ...button, marginTop: "22px" }}>
        Update billing
      </Button>
    </AuthEmailLayout>
  )
}

export { PaymentFailedEmail }
