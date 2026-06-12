import { createFileRoute } from "@tanstack/react-router"

import { PricingPage } from "@/features/marketing/components/pricing-page"

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "RocketRota Pricing | Simple pricing for growing teams" },
      {
        name: "description",
        content:
          "RocketRota pricing starts at £30 per location with 10 employees included, then £2 per extra employee.",
      },
    ],
  }),
  component: PricingRoute,
})

function PricingRoute() {
  return <PricingPage />
}
