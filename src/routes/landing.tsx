import { createFileRoute } from "@tanstack/react-router"

import { LandingPreviewPage } from "@/features/marketing/components/landing-preview/landing-preview-page"
import { getSession } from "@/lib/auth-server"

export const Route = createFileRoute("/landing")({
  loader: async () => ({ isAuthenticated: Boolean(await getSession()) }),
  head: () => ({
    meta: [
      { title: "RocketRota | A fresh launch" },
      { name: "robots", content: "noindex, follow" },
      {
        name: "description",
        content:
          "Rota management that launches productivity. Plan rotas, track time and bring your team together with RocketRota.",
      },
    ],
  }),
  component: LandingPreview,
})

function LandingPreview() {
  const { isAuthenticated } = Route.useLoaderData()
  return <LandingPreviewPage isAuthenticated={isAuthenticated} />
}
