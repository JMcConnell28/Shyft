import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export function PreviewFrame({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <figure aria-label={`${title} example workspace`}>
      <div className="feature-preview-frame">
        <div className="feature-preview-toolbar">
          <div>
            <Icon size={18} aria-hidden="true" />
            <strong>Harbour House</strong>
            <span className="feature-preview-breadcrumb">/ {title}</span>
          </div>
          <span className="feature-preview-example">Example workspace</span>
        </div>
        <div className="feature-preview-body">{children}</div>
      </div>
      <figcaption className="marketing-visual-caption">
        An interactive example with fictional staff and business details.
      </figcaption>
    </figure>
  )
}

export function PreviewPerson({
  name,
  initials,
}: {
  name: string
  initials: string
}) {
  return (
    <span className="feature-preview-person">
      <span aria-hidden="true">{initials}</span>
      <strong>{name}</strong>
    </span>
  )
}

export function PreviewStatus({
  children,
  tone = "neutral",
}: {
  children: ReactNode
  tone?: "positive" | "neutral" | "attention"
}) {
  return (
    <span className={`feature-preview-status feature-preview-status-${tone}`}>
      {children}
    </span>
  )
}
