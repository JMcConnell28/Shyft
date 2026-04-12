import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/_verified/o/$orgSlug/dashboard")(
  {
    head: () => ({
      meta: [
        { title: "Dashboard | Shyft" },
        {
          name: "description",
          content: "Your active Shyft workspace and organization dashboard.",
        },
      ],
    }),
    component: DashboardWorkspaceRoute,
  }
)

function DashboardWorkspaceRoute() {
  return (
    <div>
      <span>Dashboard</span>
    </div>
  )
}
