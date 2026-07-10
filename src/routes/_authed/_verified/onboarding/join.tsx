import { createFileRoute } from "@tanstack/react-router"

import { JoinWorkplacePage } from "@/features/onboarding/components/join-workplace-page"

export const Route = createFileRoute("/_authed/_verified/onboarding/join")({
  head: () => ({
    meta: [
      { title: "Join Workplace | RocketRota" },
      {
        name: "description",
        content: "Join a RocketRota workplace with an invite link.",
      },
    ],
  }),
  component: JoinWorkplacePage,
})
