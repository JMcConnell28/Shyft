import { Link } from "@tanstack/react-router"
import { useCustomer, useCustomerTags } from "../hooks/use-customers"
import { CustomerStageBadge } from "./customer-stage-badge"
import { CustomerLocationSection } from "./customer-location"
import { formatDateTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function CustomerPage({ id, canManage }: { id: string; canManage: boolean }) {
  const query = useCustomer(id)
  const tagQuery = useCustomerTags(id, canManage)
  const data = query.data
  return (
    <div className="space-y-5">
      <Link to="/customers" className="text-sm text-blue-700 hover:underline">
        ← All customers
      </Link>
      {query.isPending && <p role="status">Loading customer…</p>}
      {query.isError && (
        <p role="alert">
          Could not load customer.{" "}
          <Button variant="secondary" onClick={() => query.refetch()}>
            Try again
          </Button>
        </p>
      )}
      {data === null && <p>This customer could not be found.</p>}
      {data && (
        <>
          <header className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                {data.customer.name}
              </h1>
              <CustomerStageBadge stage={data.customer.stage} />
            </div>
            <p className="text-sm text-slate-500">
              {data.customer.email ?? "No contact email"} · Joined{" "}
              {formatDateTime(data.customer.createdAt)}
            </p>
          </header>
          <div className="flex flex-wrap gap-x-8 gap-y-3 border-y border-slate-200 py-4 text-sm">
            <p>
              <strong>{data.customer.locationCount}</strong> locations
            </p>
            <p>
              <strong>{data.customer.addonCount}</strong> with Time & Attendance
            </p>
            <p>
              <strong>{data.customer.stationsNeeded}</strong> stations to
              prepare
            </p>
          </div>
          {data.locations.map((location) => (
            <CustomerLocationSection
              key={location.id}
              location={location}
              customerName={data.customer.name}
              canManage={canManage}
              appBaseUrl={tagQuery.data?.appBaseUrl ?? null}
              tags={
                tagQuery.data?.tags.filter(
                  (tag) => tag.locationId === location.id
                ) ?? []
              }
              tagError={tagQuery.isError}
              tagsLoading={tagQuery.isPending}
            />
          ))}
          {data.locations.length === 0 && (
            <p className="py-8 text-sm text-slate-500">
              This customer has not created a location yet.
            </p>
          )}
        </>
      )}
    </div>
  )
}
export { CustomerPage }
