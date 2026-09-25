import {
  Button,
  Heading,
  Hr,
  Img,
  Link,
  Section,
  Text,
} from "@react-email/components"

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
  fallbackText,
  heading,
  message,
} from "@/features/email/templates/verify-email-styles"

type VerifyEmailProps = {
  brandLogoUrl: string
  emailGraphicUrl: string
  verificationUrl: string
}

function VerifyEmail({
  brandLogoUrl,
  emailGraphicUrl,
  verificationUrl,
}: VerifyEmailProps) {
  return (
    <BrandedEmailLayout
      brandLogoUrl={brandLogoUrl}
      preview={`Verify your ${appName} account`}
    >
      <Section style={content}>
        <Img
          alt="An envelope with a verification checkmark"
          height="128"
          src={emailGraphicUrl}
          style={{ display: "block", margin: "0 auto" }}
          width="128"
        />
        <Heading as="h1" style={heading}>
          Verify your email
        </Heading>
        <Text style={message}>
          Thanks for creating a {appName} account. Please verify your email
          address before continuing.
        </Text>
        <Button
          href={verificationUrl}
          rel="noopener noreferrer"
          style={button}
          target="_blank"
        >
          Verify email&nbsp;&nbsp;→
        </Button>

        <Hr style={{ ...divider, margin: "26px 0 18px" }} />

        <Text style={footerText}>
          If you didn&apos;t create an account, you can ignore this email.
        </Text>
        <Text style={fallbackText}>
          Button not working?{" "}
          <Link
            href={verificationUrl}
            rel="noopener noreferrer"
            style={footerLink}
            target="_blank"
          >
            Open the verification link.
          </Link>
        </Text>
        <Text style={{ ...footerText, marginBottom: "0" }}>
          © {new Date().getFullYear()} {appName}. All rights reserved.
        </Text>
      </Section>
    </BrandedEmailLayout>
  )
}

export { VerifyEmail }
