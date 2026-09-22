import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/_verified")({
  beforeLoad: ({ context, location }) => {
    const { user } = context.navigationSession

    if (!user.emailVerified) {
      throw redirect({
        to: "/verify-email",
        search: {
          email: user.email,
          redirect: location.href,
          sent: false,
        },
      })
    }
  },
  component: Outlet,
})
