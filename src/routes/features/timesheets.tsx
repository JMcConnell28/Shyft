import { createFileRoute } from "@tanstack/react-router"

import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/timesheets")({
  head: () => ({
    meta: [
      { title: "Timesheets for Rota-Based Teams | RocketRota" },
      {
        name: "description",
        content:
          "Review actual hours, handle clocking exceptions and prepare clean weekly timesheets with RocketRota.",
      },
    ],
  }),
  component: TimesheetsRoute,
})

function TimesheetsRoute() {
  return <FeaturePage feature="timesheets" />
}
