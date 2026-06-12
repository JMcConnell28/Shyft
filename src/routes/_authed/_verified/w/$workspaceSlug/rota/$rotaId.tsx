import { Outlet, createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/rota/$rotaId",
)({
  beforeLoad: ({ params }) => {
    z.object({
      workspaceSlug: z.string().trim().min(1),
      rotaId: z.uuid(),
    }).parse(params)
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
