import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ShieldCheckIcon } from "lucide-react"
import { usePersonalDataRequests } from "../hooks/use-personal-data-requests"
import { PersonalDataRequestCard } from "./personal-data-request-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { legalBusinessDetails } from "@/features/legal/business-details"

function PersonalDataPage({ userId }: { userId: string }) {
  const [confirmed, setConfirmed] = useState(false)
  const { query, mutation } = usePersonalDataRequests(userId)
  const pending = query.data?.requests.some((request) =>
    ["requested", "in_review", "awaiting_workplace"].includes(request.status)
  )
  return (
    <div className="settings-content mx-auto w-full max-w-3xl space-y-4">
      <SettingsSection
        title="Privacy & data"
        icon={ShieldCheckIcon}
        description="Request a copy of the personal information held about you."
      >
        <div className="space-y-3 py-4 text-sm">
          <p>
            Your request covers your account and relevant records about you,
            including past employment, shifts, attendance and support
            conversations. We review the response to protect other people’s
            information.
          </p>
          <p>
            RocketRota handles its own account information and coordinates with
            your workplace where it controls workforce records. We will explain
            the scope of the response and any follow-up.
          </p>
          <p>
            Requests are normally free, with a response within one calendar
            month. We will explain any lawful extension. Requesting a copy does
            not delete your account or affect your subscription.
          </p>
          <p>
            If you cannot sign in, need an accessible format, or want help with
            a request, email{" "}
            <a
              className="underline"
              href={`mailto:${legalBusinessDetails.contactEmail}`}
            >
              {legalBusinessDetails.contactEmail}
            </a>
            . You can also{" "}
            <Link to="/privacy" className="underline">
              read the privacy notice
            </Link>
            .
          </p>
        </div>
      </SettingsSection>
      {query.isPending && <p role="status">Loading your requests…</p>}
      {query.isError && (
        <div role="alert" className="space-y-2">
          <p>
            We could not load your requests. Check that your email is verified,
            or contact us for help.
          </p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Try again
          </Button>
        </div>
      )}
      {query.data && (
        <section aria-label="Your personal data requests" className="space-y-3">
          {query.data.requests.map((request) => (
            <PersonalDataRequestCard key={request.id} request={request} />
          ))}
          {query.data.requests.length === 0 && (
            <p className="text-sm text-muted-foreground">
              You have not submitted a personal data request yet.
            </p>
          )}
          {pending ? (
            <p role="status" className="text-sm">
              You already have a request in progress. Updates will appear here
              and we will email you when there is a change.
            </p>
          ) : (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={confirmed}
                  onCheckedChange={(value) => setConfirmed(value === true)}
                />
                <span>
                  I want to request a copy of the personal data held about me.
                </span>
              </label>
              <Button
                disabled={!confirmed || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? "Submitting…" : "Request my data"}
              </Button>
              {mutation.isError && (
                <p role="alert" className="text-sm text-destructive">
                  Your request could not be submitted. Please try again or email
                  us.
                </p>
              )}
            </div>
          )}
          {query.data.events.length > 0 && (
            <details className="space-y-2 text-sm">
              <summary className="cursor-pointer font-medium">
                Request updates
              </summary>
              <ul className="space-y-2 pt-2">
                {query.data.events.map((event) => (
                  <li key={event.id}>
                    <time>
                      {new Date(event.createdAt).toLocaleString("en-GB")}
                    </time>
                    <p className="whitespace-pre-wrap">{event.message}</p>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}
    </div>
  )
}
export { PersonalDataPage }
