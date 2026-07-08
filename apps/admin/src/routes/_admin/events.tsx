import { createFileRoute } from "@tanstack/react-router"

import { EventsPage } from "@/features/events/components/events-page"

export const Route = createFileRoute("/_admin/events")({
  component: EventsPage,
})
