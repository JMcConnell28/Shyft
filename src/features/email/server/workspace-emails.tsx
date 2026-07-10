import "@tanstack/react-start/server-only"

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
  input: SendWorkspaceWelcomeEmailInput,
) {
  await sendTransactionalEmail({
    to: input.to,
    subject: `${input.workspaceName} is ready in RocketRota`,
    react: (
      <WorkspaceWelcomeEmail
        dashboardUrl={input.dashboardUrl}
        userName={input.userName}
        workspaceName={input.workspaceName}
        workspaceType={input.workspaceType}
      />
    ),
    text: `${input.workspaceName} is ready in RocketRota. Open your workspace here: ${input.dashboardUrl}`,
  })
}

export { sendWorkspaceWelcomeEmail }
