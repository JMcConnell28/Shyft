import { createFileRoute } from "@tanstack/react-router"

import { UsersPage } from "@/features/users/components/users-page"

export const Route = createFileRoute("/_admin/users")({
  component: UsersPage,
})
