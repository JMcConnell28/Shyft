import { createFileRoute } from "@tanstack/react-router"
import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/staff-updates")({
  head: () => ({
    meta: [
      { title: "Staff Updates & Team Announcements | RocketRota" },
      {
        name: "description",
        content:
          "Keep your team connected with staff announcements, published rotas and important updates in RocketRota.",
      },
    ],
  }),
  component: () => <FeaturePage feature="staff-updates" />,
})
