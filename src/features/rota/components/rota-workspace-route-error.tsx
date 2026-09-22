import { useRouter } from "@tanstack/react-router"

import { RotaWorkspaceErrorState } from "@/features/rota/components/rota-workspace-error-state"

function RotaWorkspaceRouteError({ error }: { error: Error }) {
  const router = useRouter()

  return (
    <RotaWorkspaceErrorState
      title="We could not load this rota"
      message={error.message}
      onRetry={() => {
        void router.invalidate()
      }}
    />
  )
}

export { RotaWorkspaceRouteError }
