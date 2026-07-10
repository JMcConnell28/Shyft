import "@tanstack/react-start/server-only"

import { PaymentFailedEmail } from "@/features/email/templates/payment-failed"
import { TrialEndingEmail } from "@/features/email/templates/trial-ending"
import { sendTransactionalEmail } from "@/lib/email"

type BillingEmailInput = {
  billingUrl: string
  to: string
  userName: string
  workspaceName: string
}

type SendTrialEndingEmailInput = BillingEmailInput & {
  trialEndsLabel: string
}

async function sendPaymentFailedEmail(input: BillingEmailInput) {
  await sendTransactionalEmail({
    to: input.to,
    subject: `Payment failed for ${input.workspaceName}`,
    react: (
      <PaymentFailedEmail
        billingUrl={input.billingUrl}
        userName={input.userName}
        workspaceName={input.workspaceName}
      />
    ),
    text: `Payment failed for ${input.workspaceName}. Update billing here: ${input.billingUrl}`,
  })
}

async function sendTrialEndingEmail(input: SendTrialEndingEmailInput) {
  await sendTransactionalEmail({
    to: input.to,
    subject: `${input.workspaceName} trial ends ${input.trialEndsLabel}`,
    react: (
      <TrialEndingEmail
        billingUrl={input.billingUrl}
        trialEndsLabel={input.trialEndsLabel}
        userName={input.userName}
        workspaceName={input.workspaceName}
      />
    ),
    text: `${input.workspaceName} trial ends ${input.trialEndsLabel}. Review billing here: ${input.billingUrl}`,
  })
}

export { sendPaymentFailedEmail, sendTrialEndingEmail }
