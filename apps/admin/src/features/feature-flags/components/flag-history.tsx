import { useFlagHistory } from "../hooks/use-flag-details"
import type { FeatureFlagKey } from "@rocketrota/shared/feature-flags/types"
import { formatDateTime } from "@/lib/utils"

function FlagHistory({ flagKey }: { flagKey: FeatureFlagKey }) {
  const query = useFlagHistory(flagKey)
  return (
    <div className="space-y-3 border-t border-slate-200 pt-4">
      <h3 className="text-sm font-semibold">Recent changes</h3>
      {query.isPending && <p role="status">Loading history…</p>}
      {query.isError && (
        <p role="alert">
          Could not load history.{" "}
          <button className="underline" onClick={() => query.refetch()}>
            Try again
          </button>
        </p>
      )}
      {query.data?.length === 0 && (
        <p className="text-sm text-slate-500">No changes recorded yet.</p>
      )}
      {query.data?.map((entry) => (
        <div
          key={entry.id}
          className="space-y-1 border-b border-slate-100 pb-2 text-xs"
        >
          <p className="font-medium">
            {entry.actor} · {formatDateTime(entry.createdAt)}
          </p>
          <p className="break-all text-slate-500">
            {entry.locationId
              ? (entry.locationName ?? "Deleted location")
              : "Global setting"}
          </p>
          <p className="break-all">
            {entry.before} → {entry.after}
          </p>
          {entry.reason && <p>{entry.reason}</p>}
        </div>
      ))}
    </div>
  )
}
export { FlagHistory }
