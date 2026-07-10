import { Button, Heading, Text } from "@react-email/components"

import { AuthEmailLayout } from "@/features/email/templates/auth-email-layout"
import {
  appName,
  button,
  heading,
  mutedBox,
  text,
} from "@/features/email/templates/email-styles"

type WorkspaceWelcomeEmailProps = {
  dashboardUrl: string
  userName: string
  workspaceName: string
  workspaceType: "location" | "organization"
}

function WorkspaceWelcomeEmail({
  dashboardUrl,
  userName,
  workspaceName,
  workspaceType,
}: WorkspaceWelcomeEmailProps) {
  return (
    <AuthEmailLayout preview={`${workspaceName} is ready in ${appName}`}>
      <Heading as="h1" style={heading}>
        Your workspace is ready
      </Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        {workspaceName} has been created in {appName}. You can now add your
        team, set up zones, and build your first rota.
      </Text>
      <div style={mutedBox}>
        <Text style={{ ...text, margin: 0 }}>
          Start with the basics: invite your team, check your location settings,
          then publish the first rota when it is ready.
        </Text>
      </div>
      <Button href={dashboardUrl} style={{ ...button, marginTop: "22px" }}>
        Open {workspaceType}
      </Button>
    </AuthEmailLayout>
  )
}

export { WorkspaceWelcomeEmail }
