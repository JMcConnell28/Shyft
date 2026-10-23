import { createFileRoute } from "@tanstack/react-router"

import { DemoRotaPage } from "@/features/rota-demo/components/demo-rota-page"
import { RotaWorkspaceSkeleton } from "@/features/rota/components/rota-workspace-skeleton"

export const Route = createFileRoute("/demo")({
  ssr: false,
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
