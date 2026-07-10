import "@tanstack/react-start/server-only"

import { sendWorkspaceWelcomeEmail } from "@/features/email/server/workspace-emails"
import { buildAppUrl } from "@/lib/app-url.server"

type SendWorkspaceWelcomeNotificationInput = {
  dashboardPath: string
  to: string
  userName: string
  workspaceName: string
  workspaceType: "location" | "organization"
}

async function sendWorkspaceWelcomeNotification(
  input: SendWorkspaceWelcomeNotificationInput,
) {
  try {
    await sendWorkspaceWelcomeEmail({
      to: input.to,
      dashboardUrl: buildAppUrl(input.dashboardPath),
      userName: input.userName,
      workspaceName: input.workspaceName,
      workspaceType: input.workspaceType,
    })

    return { sent: true }
  } catch (error) {
    console.error("Workspace welcome email delivery failed.", error)

    return { sent: false }
  }
}

export { sendWorkspaceWelcomeNotification }
