import "@tanstack/react-start/server-only"

import { getOrganizationWelcomeImageUrls } from "@/features/email/server/email-assets"
import { OrganizationWelcomeEmail } from "@/features/email/templates/organization-welcome"
import { WorkspaceWelcomeEmail } from "@/features/email/templates/workspace-welcome"
import { sendTransactionalEmail } from "@/lib/email"

type SendWorkspaceWelcomeEmailInput = {
  dashboardUrl: string
  to: string
  userName: string
  workspaceName: string
  workspaceType: "location" | "organization"
}

async function sendWorkspaceWelcomeEmail(
  input: SendWorkspaceWelcomeEmailInput
) {
  const isOrganization = input.workspaceType === "organization"
  const imageUrls = isOrganization ? getOrganizationWelcomeImageUrls() : null

  await sendTransactionalEmail({
    to: input.to,
    subject: isOrganization
      ? `Welcome to RocketRota — ${input.workspaceName} is ready`
      : `${input.workspaceName} is ready in RocketRota`,
    react: imageUrls ? (
      <OrganizationWelcomeEmail
        brandLogoUrl={imageUrls.logo}
        dashboardUrl={input.dashboardUrl}
        helpUrl={new URL("/help", input.dashboardUrl).toString()}
        organizationName={input.workspaceName}
        userName={input.userName}
        welcomeGraphicUrl={imageUrls.graphic}
      />
    ) : (
      <WorkspaceWelcomeEmail
        dashboardUrl={input.dashboardUrl}
        userName={input.userName}
        workspaceName={input.workspaceName}
        workspaceType={input.workspaceType}
      />
    ),
    text: isOrganization
      ? `Hi ${input.userName}, ${input.workspaceName} is ready in RocketRota. Your first location is set up. Invite your team, build your first rota, and review billing when you are ready. Open your dashboard: ${input.dashboardUrl}`
      : `${input.workspaceName} is ready in RocketRota. Open your workspace here: ${input.dashboardUrl}`,
  })
}

export { sendWorkspaceWelcomeEmail }
