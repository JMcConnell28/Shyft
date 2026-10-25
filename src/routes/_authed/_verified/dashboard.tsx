import { createFileRoute } from "@tanstack/react-router"

import { loadDashboardEntry } from "@/features/navigation/load-dashboard-entry"

export const Route = createFileRoute("/_authed/_verified/dashboard")({
  beforeLoad: ({ context }) => loadDashboardEntry(context),
  head: () => ({
    meta: [
      { title: "Dashboard | RocketRota" },
      {
        name: "description",
        content: "Your active RocketRota workspace and organization dashboard.",
      },
    ],
  }),
})
