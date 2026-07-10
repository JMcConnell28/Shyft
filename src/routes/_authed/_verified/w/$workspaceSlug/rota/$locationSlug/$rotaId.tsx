import { Outlet, createFileRoute } from "@tanstack/react-router"

import { rotaRouteParamsSchema } from "@/lib/rota-schemas"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/rota/$locationSlug/$rotaId",
)({
  beforeLoad: ({ params }) => {
    rotaRouteParamsSchema
      .omit({
        orgSlug: true,
      })
      .extend({
        workspaceSlug: rotaRouteParamsSchema.shape.orgSlug,
      })
      .parse(params)
  },
  head: () => ({
    meta: [
      { title: "Rota Week | RocketRota" },
      {
        name: "description",
        content: "Create, review, and publish a single weekly rota in RocketRota.",
      },
    ],
  }),
  component: RotaDetailRoute,
})

function RotaDetailRoute() {
  return <Outlet />
}
