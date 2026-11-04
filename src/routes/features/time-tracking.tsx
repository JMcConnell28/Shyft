import { createFileRoute } from "@tanstack/react-router"
import { createMarketingHead } from "@/features/marketing/utils/marketing-head"

import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/time-tracking")({
  head: () =>
    createMarketingHead({
      path: "/features/time-tracking",
      title: "Time Tracking for Shift Teams | RocketRota",
      description:
        "Track staff clock-ins, monitor live attendance and review shift-based time records with RocketRota.",
    }),
  component: TimeTrackingRoute,
})

function TimeTrackingRoute() {
  return <FeaturePage feature="time-tracking" />
}
