import { createFileRoute } from "@tanstack/react-router"

import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/time-tracking")({
  head: () => ({
    meta: [
      { title: "Time Tracking for Shift Teams | RocketRota" },
      {
        name: "description",
        content:
          "Track staff clock-ins, monitor live attendance and review shift-based time records with RocketRota.",
      },
    ],
  }),
  component: TimeTrackingRoute,
})

function TimeTrackingRoute() {
  return <FeaturePage feature="time-tracking" />
}
