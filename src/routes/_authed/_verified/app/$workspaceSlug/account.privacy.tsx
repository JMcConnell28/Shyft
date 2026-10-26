import { createFileRoute } from "@tanstack/react-router"
import { PersonalDataPage } from "@/features/personal-data/components/personal-data-page"

export const Route = createFileRoute(
  "/_authed/_verified/app/$workspaceSlug/account/privacy"
)({
  head: () => ({ meta: [{ title: "Privacy & data | RocketRota" }] }),
  component: PrivacyRoute,
})
function PrivacyRoute() {
  const { viewer } = Route.useRouteContext()
  return <PersonalDataPage userId={viewer.user.id} />
}
