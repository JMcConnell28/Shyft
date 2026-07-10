import { createFileRoute } from "@tanstack/react-router"

import { AnnouncementsPage } from "@/features/announcements/components/announcements-page"
import { getAnnouncementsPageData } from "@/features/announcements/server-fns"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/announcements",
)({
  loader: async ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      throw new Error("An active workspace is required.")
    }

    const data = await getAnnouncementsPageData({
      data:
        activeWorkspace.type === "organization"
          ? {
              organizationId: activeWorkspace.id,
              userId: context.viewer.user.id,
            }
          : {
              locationId: activeWorkspace.id,
              userId: context.viewer.user.id,
            },
    })

    return { data }
  },
  component: WorkspaceAnnouncementsRoute,
})

function WorkspaceAnnouncementsRoute() {
  const { viewer } = Route.useRouteContext()
  const { data } = Route.useLoaderData()
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required.")
  }

  return (
    <AnnouncementsPage
      initialData={data}
      organizationId={
        activeWorkspace.type === "organization" ? activeWorkspace.id : undefined
      }
      locationId={
        activeWorkspace.type === "location" ? activeWorkspace.id : undefined
      }
      userId={viewer.user.id}
    />
  )
}
