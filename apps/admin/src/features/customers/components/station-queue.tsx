import { Link } from "@tanstack/react-router"
import { useStationQueue } from "../hooks/use-customers"
import { Button } from "@/components/ui/button"

function StationQueue() {
  const query = useStationQueue()
  return (
    <section className="overflow-hidden rounded-lg border border-amber-200 bg-white">
      <header className="border-b border-amber-100 bg-amber-50 px-4 py-3">
        <h2 className="font-semibold text-amber-950">
          Stations to prepare {query.data ? `(${query.data.length})` : ""}
        </h2>
        <p className="mt-1 text-sm text-amber-800">
          Paid customers with Time & Attendance who are waiting for their
          station.
        </p>
      </header>
      {query.isPending && (
        <p className="p-4 text-sm" role="status">
          Loading station requests…
        </p>
      )}
      {query.isError && (
        <p className="p-4 text-sm" role="alert">
          Could not load station requests.{" "}
          <Button variant="secondary" onClick={() => query.refetch()}>
            Try again
          </Button>
        </p>
      )}
      {query.data?.length === 0 && (
        <p className="p-4 text-sm text-slate-500">
          No paid station requests are waiting.
        </p>
      )}
      <ul className="divide-y divide-slate-100">
        {query.data?.map((item) => (
          <li
            key={item.requestId}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold">
                {item.customerName} · {item.locationName}
              </p>
              <p className="text-xs text-slate-500">
                {item.source === "included"
                  ? "Included station · "
                  : "Extra station · "}
                {item.hasTag
                  ? "NFC data created · Check setup and dispatch"
                  : "NFC tag needs creating"}
              </p>
            </div>
            <Link
              className="text-sm font-semibold text-blue-700 hover:underline"
              to="/customers/$customerId"
              params={{ customerId: item.customerId }}
            >
              Open customer →
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
export { StationQueue }
