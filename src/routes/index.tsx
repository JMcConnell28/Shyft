import { createFileRoute, redirect } from "@tanstack/react-router"

import { LandingPage } from "@/components/app/landing-page"
import { getHelpHostState } from "@/features/help-center/server/host"
import { getSession } from "@/lib/auth-server"

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
  head: () => ({
    meta: [
      { title: "RocketRota | Rota management that launches productivity" },
      {
        name: "description",
        content:
          "RocketRota helps teams build fair, efficient rotas with less admin and more clarity.",
      },
    ],
  }),
  component: App,
})

function App() {
  const { isAuthenticated } = Route.useLoaderData()

  return <LandingPage isAuthenticated={isAuthenticated} />
}
