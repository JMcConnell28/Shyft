import { createFileRoute } from "@tanstack/react-router"

import { HelpCenterPage } from "@/features/help-center/components/help-center-page"

export const Route = createFileRoute("/help/")({
  head: () => ({
    meta: [
      { title: "RocketRota Help Centre" },
      {
        name: "description",
        content:
          "Guides for employees and managers: rotas, clocking, timesheets, shift swaps, accounts and troubleshooting.",
      },
    ],
  }),
  component: HelpIndexRoute,
})

function HelpIndexRoute() {
  return <HelpCenterPage />
}
