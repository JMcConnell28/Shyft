import { createFileRoute } from "@tanstack/react-router"

import { ErrorsPage } from "@/features/errors/components/errors-page"

export const Route = createFileRoute("/_admin/errors")({
  component: ErrorsPage,
})
