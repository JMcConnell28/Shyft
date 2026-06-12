import { createFileRoute, redirect } from "@tanstack/react-router"

import { LandingPage } from "@/components/app/landing-page"
import { getHelpHostState } from "@/features/help-center/server/host"

export const Route = createFileRoute("/")({
  loader: async () => {
    const { isHelpHost } = await getHelpHostState()

    if (isHelpHost) {
      throw redirect({ to: "/help" })
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
  return <LandingPage />
}
