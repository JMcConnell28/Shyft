import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/_verified")({
  beforeLoad: ({ context, location }) => {
    const { viewer } = context

    if (!viewer.user.emailVerified) {
      throw redirect({
        to: "/verify-email",
        search: {
          email: viewer.user.email,
          redirect: location.href,
          sent: false,
        },
      })
    }
  },
  component: Outlet,
})
