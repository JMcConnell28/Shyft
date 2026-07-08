import { createFileRoute } from "@tanstack/react-router"

import { WorkspacesPage } from "@/features/workspaces/components/workspaces-page"

export const Route = createFileRoute("/_admin/workspaces")({
  component: WorkspacesPage,
})
