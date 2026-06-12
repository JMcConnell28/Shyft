import { Button, Heading, Link, Text } from "@react-email/components"

import { AuthEmailLayout } from "@/features/email/templates/auth-email-layout"
import { appName, button, heading, link, text } from "@/features/email/templates/email-styles"

type ResetPasswordEmailProps = {
  resetUrl: string
  userName: string
}

function ResetPasswordEmail({ resetUrl, userName }: ResetPasswordEmailProps) {
  return (
    <AuthEmailLayout preview={`Reset your ${appName} password`}>
      <Heading as="h1" style={heading}>
        Reset your password
      </Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        Use this secure link to choose a new password for your {appName}
        account.
      </Text>
      <Button href={resetUrl} style={button}>
        Reset password
      </Button>
      <Text style={{ ...text, marginTop: "22px" }}>
        If the button does not work, open this link:
        <br />
        <Link href={resetUrl} style={link}>
          {resetUrl}
        </Link>
      </Text>
    </AuthEmailLayout>
  )
}

export { ResetPasswordEmail }
