import { createFileRoute, redirect, useLocation } from "@tanstack/react-router"
import { PermissionsPage } from "@/features/settings/components/permissions-page"
import { SettingsLayout } from "@/features/settings/components/settings-layout"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/settings/permissions"
)({
  beforeLoad: ({ context, params }) => {
    if (context.viewer.activeRole !== "owner") {
      throw redirect({ to: "/app/$workspaceSlug/dashboard", params })
    }
  },
  head: () => ({ meta: [{ title: "Role Permissions | RocketRota" }] }),
  component: PermissionsRoute,
})

function PermissionsRoute() {
  const { workspaceSlug } = Route.useParams()
  const pathname = useLocation({ select: (location) => location.pathname })
  return (
    <SettingsLayout
      workspaceSlug={workspaceSlug}
      activePath={pathname}
      contentOnly
    >
      <PermissionsPage />
    </SettingsLayout>
  )
}
