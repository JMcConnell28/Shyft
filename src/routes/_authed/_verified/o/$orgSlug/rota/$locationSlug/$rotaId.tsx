import { createFileRoute } from "@tanstack/react-router"

import RotaWorkspace from "@/features/rota/components/rota-workspace"
import { rotaRouteParamsSchema } from "@/lib/rota-schemas"

export const Route = createFileRoute(
  "/_authed/_verified/o/$orgSlug/rota/$locationSlug/$rotaId",
)({
  beforeLoad: ({ params }) => {
    rotaRouteParamsSchema.parse(params)
  },
  head: () => ({
    meta: [
      { title: "Rota Week | Shyft" },
      {
        name: "description",
        content: "Create, review, and publish a single weekly rota in Shyft.",
      },
    ],
  }),
  component: RotaDetailRoute,
})

function RotaDetailRoute() {
  return <RotaWorkspace />
}
