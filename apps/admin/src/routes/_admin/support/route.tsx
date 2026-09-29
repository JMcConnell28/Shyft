import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/support")({
  component: Outlet,
})
