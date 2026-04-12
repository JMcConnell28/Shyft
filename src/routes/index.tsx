import { createFileRoute } from "@tanstack/react-router"

import { LandingPage } from "@/components/app/landing-page"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Northstar | TanStack Start Boilerplate" },
      {
        name: "description",
        content:
          "A polished landing page starter for a TanStack Start boilerplate with auth and dashboard foundations.",
      },
    ],
  }),
  component: App,
})

function App() {
  return <LandingPage />
}
