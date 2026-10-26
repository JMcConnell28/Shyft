import { createFileRoute } from "@tanstack/react-router"
import { PrivacyRequestPage } from "@/features/privacy/components/privacy-request-page"

export const Route = createFileRoute("/_admin/privacy/$id")({
  component: PrivacyDetailRoute,
})
function PrivacyDetailRoute() {
  return <PrivacyRequestPage id={Route.useParams().id} />
}
