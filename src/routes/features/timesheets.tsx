import { createFileRoute } from "@tanstack/react-router"
import { createMarketingHead } from "@/features/marketing/utils/marketing-head"

import { FeaturePage } from "@/features/marketing/components/feature-page"

export const Route = createFileRoute("/features/timesheets")({
  head: () =>
    createMarketingHead({
      path: "/features/timesheets",
      title: "Timesheets for Rota-Based Teams | RocketRota",
      description:
        "Review actual hours, handle clocking exceptions and prepare clean weekly timesheets with RocketRota.",
    }),
  component: TimesheetsRoute,
})

function TimesheetsRoute() {
  return <FeaturePage feature="timesheets" />
}
