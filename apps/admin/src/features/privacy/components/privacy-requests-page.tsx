import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { privacyStatusLabels } from "@rocketrota/shared/privacy"
import { usePrivacyRequests } from "../hooks/use-privacy-requests"
import { PrivacyIntakeForm } from "./privacy-intake-form"
import { Button } from "@/components/ui/button"

function PrivacyRequestsPage() {
  const [page, setPage] = useState(0)
  const query = usePrivacyRequests(page)
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold">Personal data requests</h1>
        <p className="mt-2 text-sm text-slate-600">
          Coordinate subject access requests, review disclosures and release
          secure responses. These requests are independent of billing and
          workplace membership.
        </p>
      </header>
      <PrivacyIntakeForm />
      {query.isPending && <p role="status">Loading requests…</p>}
      {query.isError && (
        <p role="alert">
          Requests could not be loaded.{" "}
          <button className="underline" onClick={() => void query.refetch()}>
            Try again
          </button>
        </p>
      )}
      {query.data?.requests.length === 0 && <p>No requests on this page.</p>}
      <div className="space-y-3">
        {query.data?.requests.map((request) => (
          <Link
            key={request.id}
            to="/privacy/$id"
            params={{ id: request.id }}
            className="block rounded-lg border bg-white p-4"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-semibold">{request.subjectName}</span>
              <span className="text-sm">
                {privacyStatusLabels[request.status]}
              </span>
            </div>
            <p className="text-sm break-all text-slate-600">
              {request.subjectEmail}
            </p>
            <p className="mt-2 text-sm">
              Expected by {new Date(request.dueAt).toLocaleDateString("en-GB")}{" "}
              · {request.id.slice(0, 8).toUpperCase()}
            </p>
          </Link>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={!query.data?.hasMore}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
export { PrivacyRequestsPage }
