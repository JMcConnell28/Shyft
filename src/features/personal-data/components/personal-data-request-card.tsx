import { privacyStatusLabels } from "@rocketrota/shared/privacy"
import type { PrivacyRequestSummary } from "@rocketrota/shared/privacy/types"
import { Badge } from "@/components/ui/badge"

const date = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
function PersonalDataRequestCard({
  request,
}: {
  request: PrivacyRequestSummary
}) {
  const expired =
    request.status === "expired" ||
    (request.expiresAt !== null &&
      new Date(request.expiresAt).getTime() <= Date.now())
  const canDownload = request.status === "ready" && !expired
  return (
    <article className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          Request {request.id.slice(0, 8).toUpperCase()}
        </p>
        <Badge variant="outline">
          {expired ? "Download expired" : privacyStatusLabels[request.status]}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Requested {date(request.requestedAt)} · Expected response by{" "}
        {date(request.dueAt)}
      </p>
      <p className="text-sm whitespace-pre-wrap">{request.message}</p>
      {canDownload && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <a
              className="text-blue-700 underline"
              href={`/api/personal-data/${request.id}?format=html`}
            >
              Download readable report
            </a>
            <a
              className="text-blue-700 underline"
              href={`/api/personal-data/${request.id}?format=json`}
            >
              Download JSON data
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Available until {date(request.expiresAt ?? request.dueAt)}. Keep the
            files private.
          </p>
        </div>
      )}
      {expired && (
        <p className="text-sm">
          Contact us to arrange another copy or submit a new request below.
          Expiry of a download does not remove your access rights.
        </p>
      )}
    </article>
  )
}
export { PersonalDataRequestCard }
