import { createFileRoute, notFound } from "@tanstack/react-router"

import { DemoRotaPage } from "@/features/rota-demo/components/demo-rota-page"
import { getDemoAvailability } from "@/features/rota-demo/server-fns"
import { RotaWorkspaceSkeleton } from "@/features/rota/components/rota-workspace-skeleton"

export const Route = createFileRoute("/demo")({
  ssr: "data-only",
  beforeLoad: async () => {
    if (!(await getDemoAvailability())) throw notFound()
  },
  pendingComponent: DemoPending,
  head: () => ({
    meta: [
      { title: "Harbour House Demo | RocketRota" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DemoRotaPage,
})

function DemoPending() {
  return (
    <div className="flex h-svh flex-col">
      <RotaWorkspaceSkeleton />
    </div>
  )
}
