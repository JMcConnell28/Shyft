import { createFileRoute } from "@tanstack/react-router"
import { createMarketingHead } from "@/features/marketing/utils/marketing-head"

import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/rota-planning")({
  head: () =>
    createMarketingHead({
      path: "/features/rota-planning",
      title: "Rota Planning Software | RocketRota",
      description:
        "Build weekly rotas, assign staff, manage shift templates and publish clean team schedules with RocketRota.",
    }),
  component: RotaPlanningRoute,
})

function RotaPlanningRoute() {
  return <FeaturePage feature="rota-planning" />
}
