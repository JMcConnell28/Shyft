import { useState } from "react"
import { featureFlagOverrideLabels } from "@rocketrota/shared/feature-flags"
import { useFlagLocations } from "../hooks/use-flag-details"
import { useFeatureFlagMutations } from "../hooks/use-feature-flag-mutations"
import { FlagSelect } from "./flag-select"
import { EffectiveFlagStatus } from "./effective-flag-status"
import type { FeatureFlagKey } from "@rocketrota/shared/feature-flags/types"
import { Button } from "@/components/ui/button"

function FlagLocationList({
  flagKey,
  reason,
}: {
  flagKey: FeatureFlagKey
  reason: string
}) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const query = useFlagLocations({ key: flagKey, search, page })
  const { locationMutation } = useFeatureFlagMutations()
  return (
    <div className="space-y-3 border-t border-slate-200 pt-4">
      <input
        aria-label="Search locations"
        placeholder="Search locations or customers"
        className="h-10 w-full rounded border border-slate-200 px-3 text-sm"
        maxLength={120}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
      />
      {query.isPending && <p role="status">Loading locations…</p>}
      {query.isError && (
        <p role="alert">
          Could not load locations.{" "}
          <button className="underline" onClick={() => query.refetch()}>
            Try again
          </button>
        </p>
      )}
      {query.data?.flag.mode === "off" && (
        <p className="text-sm text-amber-800">
          Off everywhere overrides every location. Location preferences are
          retained for the next rollout.
        </p>
      )}
      {query.data?.locations.length === 0 && (
        <p className="text-sm text-slate-500">No locations found.</p>
      )}
      {query.data?.locations.map((location) => (
        <div
          key={location.id}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"
        >
          <div>
            <p className="text-sm font-medium">{location.name}</p>
            <p className="text-xs text-slate-500">
              {location.organizationName ?? "Standalone location"}
            </p>
            <EffectiveFlagStatus value={location.effective} />
          </div>
          <FlagSelect
            label={`Feature access for ${location.name}`}
            value={location.override}
            options={["inherit", "enabled", "disabled"]}
            labels={featureFlagOverrideLabels}
            disabled={locationMutation.isPending}
            onChange={(override) => {
              locationMutation.mutate({
                key: flagKey,
                locationId: location.id,
                override,
                expectedRevision: query.data.flag.revision,
                reason,
              })
            }}
          />
        </div>
      ))}
      {locationMutation.isError && (
        <p role="alert" className="text-sm text-red-700">
          {locationMutation.error.message}
        </p>
      )}
      {query.data && query.data.total > 50 && (
        <div className="flex items-center gap-3 text-sm">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} of {Math.ceil(query.data.total / 50)}
          </span>
          <Button
            variant="secondary"
            disabled={page * 50 >= query.data.total}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
export { FlagLocationList }
