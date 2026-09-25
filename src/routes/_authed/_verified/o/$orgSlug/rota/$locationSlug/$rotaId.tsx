import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_authed/_verified/o/$orgSlug/rota/$locationSlug/$rotaId"
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/app/$workspaceSlug/rota/$locationSlug/$rotaId",
      params: {
        workspaceSlug: params.orgSlug,
        locationSlug: params.locationSlug,
        rotaId: params.rotaId,
      },
      replace: true,
    })
  },
})
