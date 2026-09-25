import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/_verified/w/$")({
  beforeLoad: ({ location }) => {
    const target = location.href.replace(/^\/w(?=\/|\?|#|$)/, "/app")
    throw redirect({ href: target, replace: true })
  },
})
