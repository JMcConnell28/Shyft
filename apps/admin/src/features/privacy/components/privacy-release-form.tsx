import { useState } from "react"
import type { ReleasePrivacyResponseInput } from "@rocketrota/shared/privacy"
import { Button } from "@/components/ui/button"

function PrivacyReleaseForm({
  disabled,
  pending,
  onRelease,
}: {
  disabled: boolean
  pending: boolean
  onRelease: (
    checks: Omit<ReleasePrivacyResponseInput, "id" | "revision">
  ) => void
}) {
  const [checks, setChecks] = useState({
    identityChecked: false,
    workplaceAuthorityChecked: false,
    thirdPartyDataReviewed: false,
    externalSourcesChecked: false,
  })
  const labels = {
    identityChecked:
      "I verified the requester’s identity and the response belongs to this account.",
    workplaceAuthorityChecked:
      "Employer-controlled records are included only under documented authority; outstanding responses are explained.",
    thirdPartyDataReviewed:
      "I reviewed third-party information, internal notes, credentials and disclosure restrictions.",
    externalSourcesChecked:
      "I completed reasonable searches beyond the automated draft, including unlinked history, provider logs, billing, correspondence and attachments where relevant.",
  }
  const complete = Object.values(checks).every(Boolean)
  return (
    <section className="space-y-3 rounded-lg border bg-white p-4">
      <h2 className="font-semibold">Release reviewed response</h2>
      {Object.entries(labels).map(([key, label]) => (
        <label key={key} className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={checks[key as keyof typeof checks]}
            onChange={(event) =>
              setChecks({ ...checks, [key]: event.target.checked })
            }
          />
          <span>{label}</span>
        </label>
      ))}
      <p className="text-sm text-slate-600">
        The saved draft is released as an immutable response for seven days. An
        email will direct the requester to sign in; the response is never
        attached.
      </p>
      <Button
        disabled={disabled || pending || !complete}
        onClick={() =>
          onRelease({
            identityChecked: true,
            workplaceAuthorityChecked: true,
            thirdPartyDataReviewed: true,
            externalSourcesChecked: true,
          })
        }
      >
        {pending ? "Releasing…" : "Release saved response"}
      </Button>
    </section>
  )
}
export { PrivacyReleaseForm }
