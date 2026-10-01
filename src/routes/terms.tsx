import { createFileRoute } from "@tanstack/react-router"

import { TermsPage } from "@/features/legal/components/terms-page"

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions | RocketRota" },
      {
        name: "description",
        content: "The terms for using RocketRota's rota and workforce tools.",
      },
    ],
  }),
  component: TermsPage,
})
