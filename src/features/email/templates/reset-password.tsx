import {
  Button,
  Heading,
  Hr,
  Link,
  Section,
  Text,
} from "@react-email/components"

import { passwordResetExpiryHours } from "@/features/email/constants/password-reset"
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
  expiry,
  fallback,
  heading,
  message,
  note,
} from "@/features/email/templates/reset-password-styles"

type ResetPasswordEmailProps = {
  brandLogoUrl: string
  helpUrl: string
  resetUrl: string
}

function ResetPasswordEmail({
  brandLogoUrl,
  helpUrl,
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <BrandedEmailLayout
      brandLogoUrl={brandLogoUrl}
      preview={`Reset your ${appName} password`}
    >
      <Section style={content}>
        <Heading as="h1" style={heading}>
          Reset your password
        </Heading>
        <Text style={message}>
          We received a request to reset your {appName} password. Click the
          button below to create a new password.
        </Text>
        <Button
          href={resetUrl}
          rel="noopener noreferrer"
          style={{ ...button, margin: "0", maxWidth: "260px" }}
          target="_blank"
        >
          Reset password&nbsp;&nbsp;→
        </Button>
        <Text style={expiry}>
          This link will expire in {passwordResetExpiryHours} hour for security
          reasons.
        </Text>

        <Hr style={{ ...divider, margin: "26px 0" }} />
        <Text style={note}>
          If you didn&apos;t request a password reset, you can safely ignore
          this email. Your password won&apos;t be changed.
        </Text>
        <Text style={fallback}>
          Button not working?{" "}
          <Link
            href={resetUrl}
            rel="noopener noreferrer"
            style={footerLink}
            target="_blank"
          >
            Open the reset link.
          </Link>
        </Text>

        <Hr style={{ ...divider, margin: "26px 0 18px" }} />
        <Text style={{ ...footerText, textAlign: "left" }}>
          <Link href={helpUrl} style={footerLink}>
            Help Centre
          </Link>
        </Text>
        <Text style={{ ...footerText, marginBottom: "0", textAlign: "left" }}>
          © {new Date().getFullYear()} {appName}. All rights reserved.
        </Text>
      </Section>
    </BrandedEmailLayout>
  )
}

export { ResetPasswordEmail }
