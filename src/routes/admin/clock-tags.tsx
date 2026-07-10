import { createFileRoute, redirect } from "@tanstack/react-router"

import { AdminClockTagsPage } from "@/features/time-clock/components/admin-clock-tags-page"
import { getAdminClockTagsPageData } from "@/features/time-clock/server-fns"
import { getViewerState } from "@/lib/onboarding"

export const Route = createFileRoute("/admin/clock-tags")({
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
  loader: ({ context }) =>
    getAdminClockTagsPageData({ data: { userId: context.viewer.user.id } }),
  head: () => ({
    meta: [
      {
        title: "Clock tag setup | RocketRota",
      },
    ],
  }),
  component: AdminClockTagsRoute,
})

function AdminClockTagsRoute() {
  const { viewer } = Route.useRouteContext()
  const data = Route.useLoaderData()

  return <AdminClockTagsPage initialData={data} userId={viewer.user.id} />
}
