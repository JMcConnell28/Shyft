import { createFileRoute, redirect } from "@tanstack/react-router"

import { EmployeeClockPage } from "@/features/time-clock/components/employee-clock-page"
import { getEmployeeClockPageData } from "@/features/time-clock/server-fns"
import { getViewerState } from "@/lib/onboarding"

export const Route = createFileRoute("/clock/$token")({
  beforeLoad: async ({ location }) => {
    const viewer = await getViewerState()

    if (!viewer) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }

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

    return { viewer }
  },
  loader: async ({ context, params }) =>
    getEmployeeClockPageData({
      data: {
        token: params.token,
        userId: context.viewer.user.id,
      },
    }),
  component: ClockTokenRoute,
})

function ClockTokenRoute() {
  const { viewer } = Route.useRouteContext()
  const { token } = Route.useParams()
  const data = Route.useLoaderData()

  return (
    <EmployeeClockPage
      initialData={data}
      token={token}
      userId={viewer.user.id}
    />
  )
}
