import { createFileRoute } from "@tanstack/react-router"

import { AnnouncementsPage } from "@/features/announcements/components/announcements-page"
import { getAnnouncementsPageData } from "@/features/announcements/server-fns"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/announcements"
)({
  loader: async ({ context }) => {
    const activeWorkspace = context.viewer.activeWorkspace

    if (!activeWorkspace) {
      throw new Error("An active workspace is required.")
    }

    const data = await getAnnouncementsPageData({
      data: {
        organizationId: activeWorkspace.id,
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
      organizationId={activeWorkspace.id}
      userId={viewer.user.id}
      workspaceName={activeWorkspace.name}
    />
  )
}
