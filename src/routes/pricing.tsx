import { createFileRoute } from "@tanstack/react-router"
import { createMarketingHead } from "@/features/marketing/utils/marketing-head"

import { PricingPage } from "@/features/marketing/components/pricing-page"

export const Route = createFileRoute("/pricing")({
  head: () =>
    createMarketingHead({
      path: "/pricing",
      title: "RocketRota Pricing | Simple pricing for growing teams",
      description:
        "RocketRota pricing starts at £30 per location with 10 employees included, then £2 per extra employee.",
    }),
  component: PricingRoute,
})

function PricingRoute() {
  return <PricingPage />
}
