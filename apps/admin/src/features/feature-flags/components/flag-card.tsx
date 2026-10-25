import { useState } from "react"
import { featureFlagModeLabels } from "@rocketrota/shared/feature-flags"
import { useFeatureFlagMutations } from "../hooks/use-feature-flag-mutations"
import { FlagSelect } from "./flag-select"
import { FlagLocationList } from "./flag-location-list"
import { FlagHistory } from "./flag-history"
import type { FeatureFlag } from "../types"
import { Button } from "@/components/ui/button"

function FlagCard({ flag }: { flag: FeatureFlag }) {
  const { updateMutation } = useFeatureFlagMutations()
  const [panel, setPanel] = useState<"locations" | "history" | null>(null)
  const [reason, setReason] = useState("")
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">{flag.name}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {flag.description}
          </p>
        </div>
        <FlagSelect
          label={`Global setting for ${flag.name}`}
          value={flag.mode}
          options={["off", "selected", "all"]}
          labels={featureFlagModeLabels}
          disabled={updateMutation.isPending}
          onChange={(mode) =>
            updateMutation.mutate({
              key: flag.key,
              mode,
              expectedRevision: flag.revision,
              reason,
            })
          }
        />
      </div>
      <label className="block text-xs text-slate-500">
        Reason for change (optional)
        <input
          className="mt-1 h-9 w-full rounded border border-slate-200 px-3 text-sm"
          maxLength={300}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => setPanel(panel === "locations" ? null : "locations")}
          aria-expanded={panel === "locations"}
        >
          Locations · {flag.overrideCount} overrides
        </Button>
        <Button
          variant="secondary"
          onClick={() => setPanel(panel === "history" ? null : "history")}
          aria-expanded={panel === "history"}
        >
          Change history
        </Button>
      </div>
      {updateMutation.isError && (
        <p role="alert" className="text-sm text-red-700">
          {updateMutation.error.message}
        </p>
      )}
      {updateMutation.isSuccess && (
        <p role="status" className="text-xs text-emerald-700">
          Setting saved.
        </p>
      )}
      {panel === "locations" && (
        <FlagLocationList flagKey={flag.key} reason={reason} />
      )}
      {panel === "history" && <FlagHistory flagKey={flag.key} />}
    </section>
  )
}
export { FlagCard }
