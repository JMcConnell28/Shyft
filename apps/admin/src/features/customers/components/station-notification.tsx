import { Link } from "@tanstack/react-router"
import { PackageIcon } from "lucide-react"
import { useStationCount } from "../hooks/use-customers"

function StationNotification() {
  const query = useStationCount()
  const count = query.data ?? 0
  return (
    <Link
      to="/clock-stations"
      className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
      aria-label={
        query.isError
          ? "Station requests unavailable — open clock stations"
          : `${count} stations awaiting setup or dispatch`
      }
    >
      <PackageIcon className="size-4" />
      <span className="hidden sm:inline">Stations</span>
      {query.isError ? (
        <span className="text-amber-700">!</span>
      ) : (
        count > 0 && (
          <span className="rounded-full bg-amber-500 px-1.5 text-xs text-white">
            {count > 99 ? "99+" : count}
          </span>
        )
      )}
    </Link>
  )
}
export { StationNotification }
