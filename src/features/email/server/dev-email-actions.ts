import "@tanstack/react-start/server-only"

import type { z } from "zod"

import {
  sendOrganizationInvitationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/features/email/server/auth-emails"
import {
  sendPaymentFailedEmail,
  sendTrialEndingEmail,
} from "@/features/email/server/billing-emails"
import { sendRotaPublishedEmail } from "@/features/email/server/rota-emails"
import { sendWorkspaceWelcomeEmail } from "@/features/email/server/workspace-emails"
import { sendDevTestEmailInputSchema } from "@/features/email/schemas/dev-email-schemas"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { buildAppUrl } from "@/lib/app-url.server"

type SendDevTestEmailInput = z.infer<typeof sendDevTestEmailInputSchema>

const testRecipient = "developer@example.com"

async function sendDevTestEmail(input: SendDevTestEmailInput) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Test emails can only be sent in development.")
  }

  await requireVerifiedSessionOrThrow()

  const workspaceSlug = input.workspaceSlug ?? "demo-workspace"
  const workspaceType = input.workspaceType ?? "organization"
  const workspacePath = `/w/${workspaceSlug}/dashboard`
  const billingPath = `/w/${workspaceSlug}/settings/billing`

  if (input.emailType === "verify-email") {
    await sendVerificationEmail({
      to: testRecipient,
      userName: "Alex Manager",
      verificationUrl: buildAppUrl("/verify-email?sent=1"),
    })
  } else if (input.emailType === "reset-password") {
    await sendPasswordResetEmail({
      to: testRecipient,
      userName: "Alex Manager",
      resetUrl: buildAppUrl("/reset-password?token=test-token"),
    })
  } else if (input.emailType === "organization-invitation") {
    await sendOrganizationInvitationEmail({
      to: testRecipient,
      invitationUrl: buildAppUrl("/accept-invitation/test-invitation"),
      organizationName: "The Crown Tavern",
      role: "manager",
    })
  } else if (input.emailType === "workspace-welcome") {
    await sendWorkspaceWelcomeEmail({
      to: testRecipient,
      dashboardUrl: buildAppUrl(workspacePath),
      userName: "Alex Manager",
      workspaceName:
        workspaceType === "organization" ? "The Crown Group" : "The Crown Tavern",
      workspaceType,
    })
  } else if (input.emailType === "rota-published") {
    await sendRotaPublishedEmail({
      to: testRecipient,
      locationName: "The Crown Tavern",
      rotaUrl: buildAppUrl(`/w/${workspaceSlug}/rota/test-rota/view`),
      userName: "Sam Taylor",
      weekLabel: "8 Jun - 14 Jun 2026",
      shifts: [
        {
          dayLabel: "Mon 8 Jun",
          timeLabel: "09:00 - 17:00",
          zoneName: "Front Bar",
        },
        {
          dayLabel: "Thu 11 Jun",
          timeLabel: "17:00 - Close",
          zoneName: "Garden",
        },
      ],
    })
  } else if (input.emailType === "trial-ending") {
    await sendTrialEndingEmail({
      to: testRecipient,
      billingUrl: buildAppUrl(billingPath),
      trialEndsLabel: "14 Jun 2026",
      userName: "Alex Manager",
      workspaceName: "The Crown Tavern",
    })
  } else {
    await sendPaymentFailedEmail({
      to: testRecipient,
      billingUrl: buildAppUrl(billingPath),
      userName: "Alex Manager",
      workspaceName: "The Crown Tavern",
    })
  }

  return { success: true }
}

export { sendDevTestEmail }
