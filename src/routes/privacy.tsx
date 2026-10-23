import { createFileRoute } from "@tanstack/react-router"

import { PrivacyPage } from "@/features/legal/components/privacy-page"

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | RocketRota" },
      {
        name: "description",
        content:
          "How RocketRota handles account, workforce and billing information, and your privacy rights.",
      },
    ],
  }),
  component: PrivacyPage,
})
