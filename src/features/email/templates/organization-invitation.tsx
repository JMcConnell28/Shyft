import { Button, Heading, Link, Text } from "@react-email/components"

import { AuthEmailLayout } from "@/features/email/templates/auth-email-layout"
import { appName, button, heading, link, text } from "@/features/email/templates/email-styles"

type OrganizationInvitationEmailProps = {
  invitationUrl: string
  organizationName: string
  role: string
}

function OrganizationInvitationEmail({
  invitationUrl,
  organizationName,
  role,
}: OrganizationInvitationEmailProps) {
  return (
    <AuthEmailLayout preview={`Join ${organizationName} on ${appName}`}>
      <Heading as="h1" style={heading}>
        You have been invited
      </Heading>
      <Text style={text}>
        Join {organizationName} on {appName} as {role}.
      </Text>
      <Button href={invitationUrl} style={button}>
        Accept invitation
      </Button>
      <Text style={{ ...text, marginTop: "22px" }}>
        If the button does not work, open this link:
        <br />
        <Link href={invitationUrl} style={link}>
          {invitationUrl}
        </Link>
      </Text>
    </AuthEmailLayout>
  )
}

export { OrganizationInvitationEmail }
