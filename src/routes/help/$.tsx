import { createFileRoute } from "@tanstack/react-router"

import { HelpCenterPage } from "@/features/help-center/components/help-center-page"

export const Route = createFileRoute("/help/$")({
  loader: async ({ params }) => {
    const { getHelpPage } = await import("@/features/help-center/source")
    const page = getHelpPage(params._splat?.split("/").filter(Boolean))
    return { title: page?.title, description: page?.description }
  },
  head: ({ loaderData }) => {
    return {
      meta: [
        {
          title: loaderData?.title
            ? `${loaderData.title} | RocketRota Help`
            : "RocketRota Help Centre",
        },
        {
          name: "description",
          content:
            loaderData?.description ??
            "Practical answers for using RocketRota.",
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
