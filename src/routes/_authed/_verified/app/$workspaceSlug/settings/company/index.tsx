import { Link, createFileRoute, useLocation } from "@tanstack/react-router"

import { CompanyEmployeeListPage } from "@/features/company/components/company-employee-list-page"
import { companyEmployeesQueryOptions } from "@/features/company/query-options"
import { SettingsLayout } from "@/features/settings/components/settings-layout"
import { buttonVariants } from "@/components/ui/button"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/company/"
)({
  loader: ({ context }) => {
    const workspace = context.viewer.activeWorkspace

    if (!workspace) {
      throw new Error("An active workspace is required for company settings.")
    }

    return context.queryClient.ensureQueryData(
      companyEmployeesQueryOptions({
        organizationId: workspace.id,
        userId: context.viewer.user.id,
      })
    )
  },
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
    <SettingsLayout workspaceSlug={workspaceSlug} activePath={pathname}>
      {viewer.activeRole === "owner" || viewer.activeRole === "admin" ? (
        <Link
          to="/app/$workspaceSlug/settings/company/join-requests"
          params={{ workspaceSlug }}
          className={`${buttonVariants({ variant: "outline" })} mb-4`}
        >
          Review join requests
        </Link>
      ) : null}
      <CompanyEmployeeListPage
        organizationId={activeWorkspace.id}
        userId={viewer.user.id}
        workspaceSlug={workspaceSlug}
      />
    </SettingsLayout>
  )
}
