import { createFileRoute } from "@tanstack/react-router"
import { PrivacyRequestsPage } from "@/features/privacy/components/privacy-requests-page"

export const Route = createFileRoute("/_admin/privacy/")({
  component: PrivacyRequestsPage,
})
