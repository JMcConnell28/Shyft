import { useState } from "react"
import { featureFlagOverrideLabels } from "@rocketrota/shared/feature-flags"
import { useLocationFlags } from "../hooks/use-flag-details"
import { useFeatureFlagMutations } from "../hooks/use-feature-flag-mutations"
import { FlagSelect } from "./flag-select"
import { EffectiveFlagStatus } from "./effective-flag-status"
import { Button } from "@/components/ui/button"

function LocationFeatureFlags({ locationId }: { locationId: string }) {
  const [expanded, setExpanded] = useState(false)
  const query = useLocationFlags(locationId, expanded)
  const { locationMutation } = useFeatureFlagMutations()
  return (
    <div className="space-y-3 border-t border-slate-200 pt-4">
      <Button
        variant="secondary"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        Feature access
      </Button>
      {expanded && (
        <>
          {query.isPending && <p role="status">Loading feature access…</p>}
          {query.isError && (
            <p role="alert">
              Could not load feature access.{" "}
              <button className="underline" onClick={() => query.refetch()}>
                Try again
              </button>
            </p>
          )}
          {query.data?.flags.map((setting) => (
            <div
              key={setting.flag.key}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"
            >
              <div>
                <p className="text-sm font-medium">{setting.flag.name}</p>
                <EffectiveFlagStatus value={setting.effective} />
              </div>
              <FlagSelect
                label={`Location setting for ${setting.flag.name}`}
                value={setting.override}
                options={["inherit", "enabled", "disabled"]}
                labels={featureFlagOverrideLabels}
                disabled={locationMutation.isPending}
                onChange={(override) =>
                  locationMutation.mutate({
                    key: setting.flag.key,
                    locationId,
                    override,
                    expectedRevision: setting.flag.revision,
                    reason: "",
                  })
                }
              />
            </div>
          ))}
          {locationMutation.isError && (
            <p role="alert" className="text-sm text-red-700">
              {locationMutation.error.message}
            </p>
          )}
          <p className="text-xs text-slate-500">
            Off everywhere takes priority. Billing and user permissions still
            apply.
          </p>
        </>
      )}
    </div>
  )
}
export { LocationFeatureFlags }
