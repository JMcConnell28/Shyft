import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { privacyStatusLabels } from "@rocketrota/shared/privacy"
import { usePrivacyRequest } from "../hooks/use-privacy-requests"
import { usePrivacyActions } from "../hooks/use-privacy-actions"
import { PrivacyStatusForm } from "./privacy-status-form"
import { PrivacyReleaseForm } from "./privacy-release-form"
import type { PrivacyAdminDetail } from "@rocketrota/shared/privacy"
import { Button } from "@/components/ui/button"

function PrivacyRequestPage({ id }: { id: string }) {
  const query = usePrivacyRequest(id)
  if (query.isPending)
    return <p role="status">Loading personal data request…</p>
  if (query.isError)
    return (
      <p role="alert">
        This request could not be loaded.{" "}
        <button className="underline" onClick={() => void query.refetch()}>
          Try again
        </button>
      </p>
    )
  return (
    <PrivacyRequestEditor
      key={`${id}-${query.data.request.revision}`}
      detail={query.data}
    />
  )
}
function PrivacyRequestEditor({ detail }: { detail: PrivacyAdminDetail }) {
  const { request } = detail
  const [draftText, setDraftText] = useState(
    detail.draft ? JSON.stringify(detail.draft, null, 2) : ""
  )
  const actions = usePrivacyActions(request.id, request.revision)
  const mutations = [
    actions.prepare,
    actions.save,
    actions.update,
    actions.release,
    actions.revoke,
  ]
  const pending = mutations.some((mutation) => mutation.isPending)
  const error = mutations.find((mutation) => mutation.error)?.error
  const editable = !["ready", "completed"].includes(request.status)
  const savedText = detail.draft ? JSON.stringify(detail.draft, null, 2) : ""
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link to="/privacy" className="text-sm underline">
        ← Personal data requests
      </Link>
      <header>
        <h1 className="text-2xl font-semibold">{request.subjectName}</h1>
        <p className="text-sm break-all">
          {request.subjectEmail} · {privacyStatusLabels[request.status]}
        </p>
        <p className="mt-2 text-sm">
          Reference {request.id} · Expected by{" "}
          {new Date(request.dueAt).toLocaleDateString("en-GB")}
        </p>
      </header>
      <p className="rounded-lg bg-amber-50 p-4 text-sm">
        The automated draft does not establish that every record has been found
        or may be disclosed. Coordinate each employer’s instructions and
        document searches and redactions. Never silently omit records because
        they are inconvenient to retrieve.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error.message}
        </p>
      )}
      {editable && (
        <>
          <PrivacyStatusForm
            id={request.id}
            revision={request.revision}
            pending={pending}
            onSave={(value) => actions.update.mutate(value)}
          />
          <section className="space-y-3 rounded-lg border bg-white p-4">
            <h2 className="font-semibold">Prepare and review response</h2>
            <p className="text-sm text-slate-600">
              Preparing replaces any saved draft. Unsaved changes in the editor
              are not released. Drafts are retained for seven days after
              preparation or saving.
            </p>
            <Button
              variant="secondary"
              disabled={pending || !detail.subjectUserId}
              onClick={() => {
                if (
                  !detail.draft ||
                  window.confirm(
                    "Replace the existing draft? Save any review work elsewhere first."
                  )
                )
                  actions.prepare.mutate()
              }}
            >
              {actions.prepare.isPending ? "Preparing…" : "Prepare fresh draft"}
            </Button>
            {draftText && (
              <>
                <label
                  className="block text-sm font-medium"
                  htmlFor="privacy-response"
                >
                  Reviewed response JSON
                </label>
                <textarea
                  id="privacy-response"
                  className="min-h-80 w-full rounded-md border p-3 font-mono text-xs"
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                  spellCheck={false}
                />
                <Button
                  disabled={pending || draftText === savedText}
                  onClick={() => actions.save.mutate(draftText)}
                >
                  Save reviewed draft
                </Button>
              </>
            )}
          </section>
          <PrivacyReleaseForm
            disabled={!detail.draft || draftText !== savedText}
            pending={pending}
            onRelease={(checks) => actions.release.mutate(checks)}
          />
        </>
      )}
      {request.status === "ready" && (
        <section className="space-y-3 rounded-lg border bg-white p-4">
          <p>
            The response has been released. Access expires{" "}
            {request.expiresAt
              ? new Date(request.expiresAt).toLocaleString("en-GB")
              : "soon"}
            .
          </p>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => {
              if (
                window.confirm(
                  "Withdraw this download? Record any further review once access is revoked."
                )
              )
                actions.revoke.mutate()
            }}
          >
            Revoke download
          </Button>
        </section>
      )}
      <section className="space-y-3">
        <h2 className="font-semibold">Request history</h2>
        {detail.events.map((event) => (
          <article
            key={event.id}
            className="rounded-lg border bg-white p-3 text-sm"
          >
            <p className="text-slate-500">
              {new Date(event.createdAt).toLocaleString("en-GB")}
            </p>
            {event.message && (
              <p className="whitespace-pre-wrap">Requester: {event.message}</p>
            )}
            {event.internalNote && (
              <p className="whitespace-pre-wrap text-slate-600">
                Internal: {event.internalNote}
              </p>
            )}
          </article>
        ))}
      </section>
    </div>
  )
}
export { PrivacyRequestPage }
