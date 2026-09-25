import "@tanstack/react-start/server-only"

import { sendOrganizationWelcomeEmail } from "@/features/email/server/organization-welcome-email"
import { buildAppUrl } from "@/lib/app-url.server"

type SendOrganizationWelcomeNotificationInput = {
  dashboardPath: string
  to: string
  userName: string
  organizationName: string
}

async function sendOrganizationWelcomeNotification(
  input: SendOrganizationWelcomeNotificationInput
) {
  try {
    await sendOrganizationWelcomeEmail({
      to: input.to,
      dashboardUrl: buildAppUrl(input.dashboardPath),
      userName: input.userName,
      organizationName: input.organizationName,
    })

    return { sent: true }
  } catch (error) {
    console.error("Workspace welcome email delivery failed.", error)

    return { sent: false }
  }
}

export { sendOrganizationWelcomeNotification }
