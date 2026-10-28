import { useState } from "react"
import { CalendarClockIcon, CheckIcon } from "lucide-react"

import { previewTeam } from "../../data/preview-team"
import { PreviewFrame, PreviewPerson, PreviewStatus } from "./preview-frame"

const hours = ["32h 00m", "31h 45m", "30h 12m", "32h 00m"]

export function TimesheetsPreview() {
  const [reviewed, setReviewed] = useState(false)
  const [reviewOnly, setReviewOnly] = useState(false)
  const rows = previewTeam
    .slice(0, 4)
    .filter((person) => !reviewOnly || (!reviewed && person.id === "oscar"))
  return (
    <PreviewFrame title="Timesheets" icon={CalendarClockIcon}>
      <div className="feature-preview-heading">
        <div>
          <p className="feature-preview-overline">19 – 25 October</p>
          <h2>A clearer weekly review</h2>
        </div>
        <PreviewStatus tone={reviewed ? "positive" : "attention"}>
          {reviewed ? "All reviewed" : "1 entry to review"}
        </PreviewStatus>
      </div>
      <div
        className="feature-preview-tabs"
        aria-label="Filter example timesheets"
      >
        <button
          type="button"
          aria-pressed={!reviewOnly}
          onClick={() => setReviewOnly(false)}
        >
          All timesheets
        </button>
        <button
          type="button"
          aria-pressed={reviewOnly}
          onClick={() => setReviewOnly(true)}
        >
          Needs review {!reviewed && "(1)"}
        </button>
      </div>
      <div className="feature-preview-table-scroll">
        <table className="feature-preview-table">
          <caption className="sr-only">Example weekly timesheets</caption>
          <thead>
            <tr>
              <th>Team member</th>
              <th>Scheduled</th>
              <th>Recorded</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((person) => {
              const needsReview = person.id === "oscar" && !reviewed
              return (
                <tr key={person.id}>
                  <td>
                    <PreviewPerson
                      name={person.name}
                      initials={person.initials}
                    />
                  </td>
                  <td>32h 00m</td>
                  <td>{hours[previewTeam.indexOf(person)]}</td>
                  <td>
                    {needsReview ? (
                      <button
                        type="button"
                        className="feature-preview-inline-action"
                        onClick={() => setReviewed(true)}
                      >
                        Mark reviewed
                      </button>
                    ) : (
                      <PreviewStatus tone="positive">
                        <CheckIcon size={12} aria-hidden="true" />
                        Reviewed
                      </PreviewStatus>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="feature-preview-empty">
          You are all caught up. Every example entry has been reviewed.
        </p>
      )}
      <p className="feature-preview-footnote">
        {reviewed
          ? "Every example entry has been reviewed."
          : "Try marking the highlighted entry as reviewed."}
      </p>
    </PreviewFrame>
  )
}
