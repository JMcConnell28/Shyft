import { createFileRoute } from "@tanstack/react-router"

import { SupportThreadPage } from "@/features/support/components/support-thread-page"

export const Route = createFileRoute("/_admin/support/$threadId")({
  component: SupportThreadRoute,
})

function SupportThreadRoute() {
  const { threadId } = Route.useParams()
  return <SupportThreadPage id={threadId} />
}
