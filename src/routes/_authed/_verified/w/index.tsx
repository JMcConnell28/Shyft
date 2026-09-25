import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/_verified/w/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard", replace: true })
  },
})
