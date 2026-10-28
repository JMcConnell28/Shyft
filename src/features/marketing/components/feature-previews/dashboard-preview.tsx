import { Link } from "@tanstack/react-router"
import {
  ArrowUpRightIcon,
  Building2Icon,
  CalendarDaysIcon,
  ClockIcon,
} from "lucide-react"

import { previewTeam } from "../../data/preview-team"
import { PreviewFrame, PreviewPerson, PreviewStatus } from "./preview-frame"

export function DashboardPreview() {
  return (
    <PreviewFrame title="Dashboard" icon={Building2Icon}>
      <div className="feature-preview-heading">
        <div>
          <p className="feature-preview-overline">Monday, 19 October</p>
          <h2>A good start to the day.</h2>
        </div>
        <span className="feature-preview-location">Harbour House</span>
      </div>
      <div className="feature-preview-metrics">
        <div>
          <span>Scheduled today</span>
          <strong>
            6 <small>people</small>
          </strong>
        </div>
        <div>
          <span>Clocked in</span>
          <strong>
            3 <small>people</small>
          </strong>
        </div>
        <div>
          <span>Needs attention</span>
          <strong>
            1 <small>entry</small>
          </strong>
        </div>
      </div>
      <div className="feature-preview-dashboard-grid">
        <section>
          <div className="feature-preview-section-title">
            <h3>On shift today</h3>
            <Link to="/features/rota-planning">
              View rotas <ArrowUpRightIcon size={14} />
            </Link>
          </div>
          {previewTeam.slice(0, 3).map((person) => (
            <div className="feature-preview-person-row" key={person.id}>
              <PreviewPerson name={person.name} initials={person.initials} />
              <span>{person.scheduled}</span>
            </div>
          ))}
        </section>
        <section className="feature-preview-actions">
          <h3>Your next steps</h3>
          <Link to="/features/time-tracking">
            <ClockIcon size={19} aria-hidden="true" />
            <span>
              <strong>Review attendance</strong>
              <small>One clock entry needs a look</small>
            </span>
            <ArrowUpRightIcon size={16} />
          </Link>
          <Link to="/features/timesheets">
            <CalendarDaysIcon size={19} aria-hidden="true" />
            <span>
              <strong>Check the week's hours</strong>
              <small>Bring scheduled and actual time together</small>
            </span>
            <ArrowUpRightIcon size={16} />
          </Link>
          <PreviewStatus tone="positive">
            Your working week, connected
          </PreviewStatus>
        </section>
      </div>
    </PreviewFrame>
  )
}
