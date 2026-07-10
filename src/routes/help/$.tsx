import { createFileRoute } from "@tanstack/react-router"

import { HelpCenterPage } from "@/features/help-center/components/help-center-page"

export const Route = createFileRoute("/help/$")({
  head: () => ({
    meta: [
      { title: "RocketRota Help Centre" },
      {
        name: "description",
        content:
          "Find setup guidance and practical answers for using RocketRota.",
      },
    ],
  }),
  component: HelpSplatRoute,
})

function HelpSplatRoute() {
  const params = Route.useParams()
  const splat = params._splat
  const slug = splat ? splat.split("/").filter(Boolean) : undefined

  return <HelpCenterPage slug={slug} />
}
