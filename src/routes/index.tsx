import { createFileRoute, redirect } from "@tanstack/react-router"

import { LandingPage } from "@/components/app/landing-page"
import { getHelpHostState } from "@/features/help-center/server/host"
import { getSession } from "@/lib/auth-server"
import { siteMetadata } from "@/features/marketing/constants/site-metadata"
import { createMarketingHead } from "@/features/marketing/utils/marketing-head"

export const Route = createFileRoute("/")({
  loader: async () => {
    const [{ isHelpHost }, session] = await Promise.all([
      getHelpHostState(),
      getSession(),
    ])

    if (isHelpHost) {
      throw redirect({ to: "/help" })
    }

    return {
      isAuthenticated: Boolean(session),
    }
  },
  head: () =>
    createMarketingHead({
      path: "/",
      title: siteMetadata.title,
      description: siteMetadata.description,
      includeSiteSchema: true,
    }),
  component: App,
})

function App() {
  const { isAuthenticated } = Route.useLoaderData()

  return <LandingPage isAuthenticated={isAuthenticated} />
}
