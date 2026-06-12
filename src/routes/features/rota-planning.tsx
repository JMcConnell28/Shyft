import { createFileRoute } from "@tanstack/react-router"

import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/rota-planning")({
  head: () => ({
    meta: [
      { title: "Rota Planning Software | RocketRota" },
      {
        name: "description",
        content:
          "Build weekly rotas, assign staff, manage shift templates and publish clean team schedules with RocketRota.",
      },
    ],
  }),
  component: RotaPlanningRoute,
})

function RotaPlanningRoute() {
  return <FeaturePage feature="rota-planning" />
}
