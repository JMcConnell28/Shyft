import { createFileRoute } from "@tanstack/react-router"
import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/manager-dashboard")({
  head: () => ({
    meta: [
      { title: "Manager Dashboard | RocketRota" },
      {
        name: "description",
        content:
          "See today's shifts, attendance and key actions in one clear manager dashboard with RocketRota.",
      },
    ],
  }),
  component: () => <FeaturePage feature="manager-dashboard" />,
})
