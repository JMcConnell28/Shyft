import "@tanstack/react-start/server-only"

import { getOrganizationWelcomeImageUrls } from "@/features/email/server/email-assets"
import { OrganizationWelcomeEmail } from "@/features/email/templates/organization-welcome"
import { sendTransactionalEmail } from "@/lib/email"

type SendOrganizationWelcomeEmailInput = {
  dashboardUrl: string
  to: string
  userName: string
  organizationName: string
}

async function sendOrganizationWelcomeEmail(
  input: SendOrganizationWelcomeEmailInput
) {
  const imageUrls = getOrganizationWelcomeImageUrls()

  await sendTransactionalEmail({
    to: input.to,
    subject: `Welcome to RocketRota — ${input.organizationName} is ready`,
    react: (
      <OrganizationWelcomeEmail
        brandLogoUrl={imageUrls.logo}
        dashboardUrl={input.dashboardUrl}
        helpUrl={new URL("/help", input.dashboardUrl).toString()}
        organizationName={input.organizationName}
        userName={input.userName}
        welcomeGraphicUrl={imageUrls.graphic}
      />
    ),
    text: `Hi ${input.userName}, ${input.organizationName} is ready in RocketRota. Your first location is set up. Invite your team, build your first rota, and review billing when you are ready. Open your dashboard: ${input.dashboardUrl}`,
  })
}

export { sendOrganizationWelcomeEmail }
