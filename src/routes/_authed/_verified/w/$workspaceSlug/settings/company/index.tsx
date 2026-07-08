import { createFileRoute, useLocation } from "@tanstack/react-router"

import { CompanyEmployeeListPage } from "@/features/company/components/company-employee-list-page"
import { SettingsLayout } from "@/features/settings/components/settings-layout"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/company/"
)({
  component: WorkspaceCompanySettingsIndexRoute,
})

function WorkspaceCompanySettingsIndexRoute() {
  const { viewer } = Route.useRouteContext()
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({
    select: (location) => location.pathname,
  })
  const activeWorkspace = viewer.activeWorkspace

  if (!activeWorkspace) {
    throw new Error("An active workspace is required for company settings.")
  }

  return (
    <SettingsLayout
      workspaceSlug={workspaceSlug}
      workspaceType={activeWorkspace.type}
      activePath={pathname}
    >
      <CompanyEmployeeListPage
        organizationId={
          activeWorkspace.type === "organization"
            ? activeWorkspace.id
            : undefined
        }
        locationId={
          activeWorkspace.type === "location" ? activeWorkspace.id : undefined
        }
        userId={viewer.user.id}
        workspaceSlug={workspaceSlug}
      />
    </SettingsLayout>
  )
}
