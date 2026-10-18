import { createFileRoute } from "@tanstack/react-router"

import { HelpCenterPage } from "@/features/help-center/components/help-center-page"
import { getHelpPage } from "@/features/help-center/source"

export const Route = createFileRoute("/help/$")({
  head: ({ params }) => {
    const page = getHelpPage(params._splat?.split("/").filter(Boolean))
    return {
      meta: [
        {
          title: page
            ? `${page.title} | RocketRota Help`
            : "RocketRota Help Centre",
        },
        {
          name: "description",
          content:
            page?.description ?? "Practical answers for using RocketRota.",
        },
      ],
    }
  },
  component: HelpSplatRoute,
})

function HelpSplatRoute() {
  const params = Route.useParams()
  const splat = params._splat
  const slug = splat ? splat.split("/").filter(Boolean) : undefined

  return <HelpCenterPage slug={slug} />
}
