import { useState } from "react"
import { SearchIcon, UsersIcon } from "lucide-react"

import { previewTeam } from "../../data/preview-team"
import { PreviewFrame, PreviewPerson, PreviewStatus } from "./preview-frame"

const teams = ["All teams", "Front of house", "Kitchen", "Bar team"] as const

export function TeamPreview() {
  const [team, setTeam] = useState<(typeof teams)[number]>("All teams")
  const [search, setSearch] = useState("")
  const rows = previewTeam.filter(
    (person) =>
      (team === "All teams" || person.team === team) &&
      `${person.name} ${person.role}`
        .toLowerCase()
        .includes(search.trim().toLowerCase())
  )
  return (
    <PreviewFrame title="Team management" icon={UsersIcon}>
      <div className="feature-preview-heading">
        <div>
          <p className="feature-preview-overline">Good people. Great teams.</p>
          <h2>
            Your team{" "}
            <span className="feature-preview-count">{previewTeam.length}</span>
          </h2>
        </div>
        <label className="feature-preview-search">
          <SearchIcon size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label="Search example team"
            placeholder="Find a team member"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>
      <div className="feature-preview-tabs" aria-label="Filter example team">
        {teams.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={team === item}
            onClick={() => setTeam(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="feature-preview-table-scroll">
        <table className="feature-preview-table">
          <caption className="sr-only">Example employee directory</caption>
          <thead>
            <tr>
              <th>Team member</th>
              <th>Team</th>
              <th>Role</th>
              <th>Location</th>
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
                <td>
                  <PreviewStatus>{person.team}</PreviewStatus>
                </td>
                <td>{person.role}</td>
                <td>Harbour House</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="feature-preview-empty">
          No team members match. Try another name or team.
        </p>
      )}
      <p className="feature-preview-footnote">
        {rows.length} of {previewTeam.length} team members · One connected
        directory
      </p>
    </PreviewFrame>
  )
}
