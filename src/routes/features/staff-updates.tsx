import { createFileRoute } from "@tanstack/react-router"
import { createMarketingHead } from "@/features/marketing/utils/marketing-head"
import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/staff-updates")({
  head: () =>
    createMarketingHead({
      path: "/features/staff-updates",
      title: "Staff Updates & Team Announcements | RocketRota",
      description:
        "Keep your team connected with staff announcements, published rotas and important updates in RocketRota.",
    }),
  component: () => <FeaturePage feature="staff-updates" />,
})
