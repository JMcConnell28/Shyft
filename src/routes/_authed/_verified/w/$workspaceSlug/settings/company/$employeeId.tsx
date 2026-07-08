import { createFileRoute, useLocation } from "@tanstack/react-router"

import { CompanyEmployeeDetailPage } from "@/features/company/components/company-employee-detail-page"
import { SettingsLayout } from "@/features/settings/components/settings-layout"

export const Route = createFileRoute(
  "/_authed/_verified/w/$workspaceSlug/settings/company/$employeeId"
)({
  component: WorkspaceCompanyEmployeeRoute,
})

function WorkspaceCompanyEmployeeRoute() {
  const { viewer } = Route.useRouteContext()
  const { employeeId, workspaceSlug } = Route.useParams()
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
      <CompanyEmployeeDetailPage
        employeeId={employeeId}
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
