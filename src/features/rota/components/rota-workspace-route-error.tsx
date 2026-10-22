import { useRouter } from "@tanstack/react-router"

import { RotaWorkspaceErrorState } from "@/features/rota/components/rota-workspace-error-state"
import { getErrorMessage } from "@/lib/errors"

function RotaWorkspaceRouteError({ error }: { error: unknown }) {
  const router = useRouter()

  return (
    <RotaWorkspaceErrorState
      title="We could not load this rota"
      message={getErrorMessage(error, "Please try again or reload the page.")}
      onRetry={() => {
        void router.invalidate()
      }}
    />
  )
}

export { RotaWorkspaceRouteError }
