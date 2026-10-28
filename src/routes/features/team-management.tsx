import { createFileRoute } from "@tanstack/react-router"
import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/team-management")({
  head: () => ({
    meta: [
      { title: "Team Management Software | RocketRota" },
      {
        name: "description",
        content:
          "Organise employees, team groups, roles and locations in one connected RocketRota workspace.",
      },
    ],
  }),
  component: () => <FeaturePage feature="team-management" />,
})
