import { Button, Heading, Link, Text } from "@react-email/components"

import { AuthEmailLayout } from "@/features/email/templates/auth-email-layout"
import { appName, button, heading, link, text } from "@/features/email/templates/email-styles"

type VerifyEmailProps = {
  userName: string
  verificationUrl: string
}

function VerifyEmail({ userName, verificationUrl }: VerifyEmailProps) {
  return (
    <AuthEmailLayout preview={`Verify your ${appName} account`}>
      <Heading as="h1" style={heading}>
        Verify your email
      </Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        Confirm this email address to finish setting up {appName} and access
        your workplace.
      </Text>
      <Button href={verificationUrl} style={button}>
        Verify email
      </Button>
      <Text style={{ ...text, marginTop: "22px" }}>
        If the button does not work, open this link:
        <br />
        <Link href={verificationUrl} style={link}>
          {verificationUrl}
        </Link>
      </Text>
    </AuthEmailLayout>
  )
}

export { VerifyEmail }
