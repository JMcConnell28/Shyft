import { createFileRoute } from "@tanstack/react-router"

import { ClockStationsPage } from "@/features/clock-stations/components/clock-stations-page"

export const Route = createFileRoute("/_admin/clock-stations")({
  component: ClockStationsPage,
})
