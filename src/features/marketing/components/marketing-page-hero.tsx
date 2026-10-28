import type { ReactNode } from "react"

import { MarketingHeader } from "./marketing-header"
import { MarketingTrialNotes } from "./marketing-trial-notes"
import { PreviewTrialLink } from "./landing-preview/preview-trial-link"

type MarketingPageHeroProps = {
  activePage: "features" | "pricing"
  eyebrow: string
  title: ReactNode
  description: string
  secondaryAction: ReactNode
  children: ReactNode
}

export function MarketingPageHero({
  activePage,
  eyebrow,
  title,
  description,
  secondaryAction,
  children,
}: MarketingPageHeroProps) {
  return (
    <section
      className="marketing-page-hero"
      aria-labelledby="marketing-page-title"
    >
      <div className="marketing-page-background" aria-hidden="true" />
      <div className="marketing-header-container">
        <MarketingHeader activePage={activePage} />
      </div>
      <div className="marketing-hero-copy">
        <p className="marketing-eyebrow">{eyebrow}</p>
        <h1 id="marketing-page-title">{title}</h1>
        <p className="marketing-hero-description">{description}</p>
        <div className="marketing-hero-actions">
          <PreviewTrialLink />
          {secondaryAction}
        </div>
        <MarketingTrialNotes />
      </div>
      <div className="marketing-hero-visual">{children}</div>
    </section>
  )
}
