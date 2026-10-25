import { useFeatureFlagsQuery } from "../hooks/use-feature-flags-query"
import { FlagCard } from "./flag-card"

function FeatureFlagsPage() {
  const query = useFeatureFlagsQuery()
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Feature flags</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Control implemented features globally or per location. Off everywhere
          overrides location settings. Changes normally reach the app within 30
          seconds.
        </p>
      </header>
      {query.isPending && <p role="status">Loading feature flags…</p>}
      {query.isError && (
        <p role="alert">
          Could not load flags.{" "}
          <button className="underline" onClick={() => query.refetch()}>
            Try again
          </button>
        </p>
      )}
      {query.data?.flags.map((flag) => (
        <FlagCard key={flag.key} flag={flag} />
      ))}
    </div>
  )
}
export { FeatureFlagsPage }
