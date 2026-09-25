import "@tanstack/react-start/server-only"

import { passwordResetExpiryHours } from "@/features/email/constants/password-reset"
import {
  getBrandedEmailLogoUrl,
  getVerificationEmailImageUrls,
} from "@/features/email/server/email-assets"
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
  const imageUrls = getVerificationEmailImageUrls()

  await sendTransactionalEmail({
    to,
    subject: `Verify your ${appName} account`,
    react: (
      <VerifyEmail
        brandLogoUrl={imageUrls.logo}
        emailGraphicUrl={imageUrls.graphic}
        verificationUrl={verificationUrl}
      />
    ),
    text: `Hi ${userName}, verify your ${appName} account by opening this link: ${verificationUrl}`,
  })
}

async function sendPasswordResetEmail({
  resetUrl,
  to,
}: SendPasswordResetEmailInput) {
  await sendTransactionalEmail({
    to,
    subject: `Reset your ${appName} password`,
    react: (
      <ResetPasswordEmail
        brandLogoUrl={getBrandedEmailLogoUrl()}
        helpUrl={new URL("/help", resetUrl).toString()}
        resetUrl={resetUrl}
      />
    ),
    text: `We received a request to reset your ${appName} password. Open this link to create a new password: ${resetUrl}\n\nThis link will expire in ${passwordResetExpiryHours} hour for security reasons. If you didn't request a password reset, you can safely ignore this email.`,
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
