import { useState } from "react"
import { TimerIcon } from "lucide-react"

import { previewTeam } from "../../data/preview-team"
import { PreviewFrame, PreviewPerson, PreviewStatus } from "./preview-frame"

const filters = ["All staff", "Clocked in", "Needs review"] as const

export function AttendancePreview() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All staff")
  const rows = previewTeam.filter(
    (person) => filter === "All staff" || person.status === filter
  )
  return (
    <PreviewFrame title="Time tracking" icon={TimerIcon}>
      <div className="feature-preview-heading">
        <div>
          <p className="feature-preview-overline">Monday, 19 October</p>
          <h2>Time tracking</h2>
        </div>
        <PreviewStatus tone="positive">Attendance overview</PreviewStatus>
      </div>
      <div className="feature-preview-metrics">
        {["Clocked in", "Starting soon", "Needs review"].map((status) => (
          <div key={status}>
            <span>{status}</span>
            <strong>
              {previewTeam.filter((person) => person.status === status).length}
            </strong>
          </div>
        ))}
      </div>
      <div
        className="feature-preview-tabs"
        aria-label="Filter example attendance"
      >
        {filters.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="feature-preview-table-scroll">
        <table className="feature-preview-table">
          <caption className="sr-only">Example staff attendance</caption>
          <thead>
            <tr>
              <th>Team member</th>
              <th>Scheduled shift</th>
              <th>Clocked in</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((person) => (
              <tr key={person.id}>
                <td>
                  <PreviewPerson
                    name={person.name}
                    initials={person.initials}
                  />
                </td>
                <td>{person.scheduled}</td>
                <td>{person.clocked}</td>
                <td>
                  <PreviewStatus
                    tone={
                      person.status === "Needs review"
                        ? "attention"
                        : person.status === "Clocked in"
                          ? "positive"
                          : "neutral"
                    }
                  >
                    {person.status}
                  </PreviewStatus>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PreviewFrame>
  )
}
