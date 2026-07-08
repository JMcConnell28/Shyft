import { createFileRoute } from "@tanstack/react-router"

import { FeatureFlagsPage } from "@/features/feature-flags/components/feature-flags-page"

export const Route = createFileRoute("/_admin/feature-flags")({
  component: FeatureFlagsPage,
})
