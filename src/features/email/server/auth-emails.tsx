import "@tanstack/react-start/server-only"

import { OrganizationInvitationEmail } from "@/features/email/templates/organization-invitation"
import { ResetPasswordEmail } from "@/features/email/templates/reset-password"
import { VerifyEmail } from "@/features/email/templates/verify-email"
import { sendTransactionalEmail } from "@/lib/email"
import { appName } from "@/features/email/templates/email-styles"

type SendVerificationEmailInput = {
  to: string
  userName: string
  verificationUrl: string
}

type SendPasswordResetEmailInput = {
  resetUrl: string
  to: string
  userName: string
}

type SendOrganizationInvitationEmailInput = {
  invitationUrl: string
  organizationName: string
  role: string
  to: string
}

async function sendVerificationEmail({
  to,
  userName,
  verificationUrl,
}: SendVerificationEmailInput) {
  await sendTransactionalEmail({
    to,
    subject: `Verify your ${appName} account`,
    react: (
      <VerifyEmail userName={userName} verificationUrl={verificationUrl} />
    ),
    text: `Verify your ${appName} account by opening this link: ${verificationUrl}`,
  })
}

async function sendPasswordResetEmail({
  resetUrl,
  to,
  userName,
}: SendPasswordResetEmailInput) {
  await sendTransactionalEmail({
    to,
    subject: `Reset your ${appName} password`,
    react: <ResetPasswordEmail resetUrl={resetUrl} userName={userName} />,
    text: `Reset your ${appName} password by opening this link: ${resetUrl}`,
  })
}

async function sendOrganizationInvitationEmail({
  invitationUrl,
  organizationName,
  role,
  to,
}: SendOrganizationInvitationEmailInput) {
  await sendTransactionalEmail({
    to,
    subject: `You were invited to ${organizationName} on ${appName}`,
    react: (
      <OrganizationInvitationEmail
        invitationUrl={invitationUrl}
        organizationName={organizationName}
        role={role}
      />
    ),
    text: `You were invited to ${organizationName} on ${appName} as ${role}. Accept the invitation here: ${invitationUrl}`,
  })
}

export {
  sendOrganizationInvitationEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
}
