"use client"

import { useServerFn } from "@tanstack/react-start"
import { FlaskConicalIcon } from "lucide-react"

import { setTrialForTesting } from "@/features/billing/server-fns"
import type { WorkspaceTrial } from "@/features/billing/types"
import { Button } from "@/components/ui/button"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function TrialTestingControls({ trial }: { trial: WorkspaceTrial }) {
  const setTrialForTestingFn = useServerFn(setTrialForTesting)

  async function setState(state: "active" | "ending-soon" | "expired" | "reset") {
    try {
      await setTrialForTestingFn({
        data: {
          organizationId: trial.organizationId ?? undefined,
          locationId: trial.locationId ?? undefined,
          state,
        },
      })
      showSuccessToast("Trial test state updated.")
      window.location.reload()
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "We could not update the trial test state.",
      })
    }
  }

  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-amber-300/80 bg-amber-50 px-3 py-2 text-amber-950">
      <FlaskConicalIcon className="size-3.5" />
      <span className="text-xs font-medium">Trial testing</span>
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() => {
          void setState("ending-soon")
        }}
      >
        Ending soon
      </Button>
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() => {
          void setState("expired")
        }}
      >
        Expired
      </Button>
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={() => {
          void setState("reset")
        }}
      >
        Reset
      </Button>
    </div>
  )
}

export { TrialTestingControls }
