import { createFileRoute } from "@tanstack/react-router"
import { createMarketingHead } from "@/features/marketing/utils/marketing-head"
import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/team-management")({
  head: () =>
    createMarketingHead({
      path: "/features/team-management",
      title: "Team Management Software | RocketRota",
      description:
        "Organise employees, team groups, roles and locations in one connected RocketRota workspace.",
    }),
  component: () => <FeaturePage feature="team-management" />,
})
