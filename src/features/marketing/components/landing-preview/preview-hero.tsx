import { CheckIcon } from "lucide-react"

import { PreviewTrialLink } from "./preview-trial-link"

export function PreviewHero() {
  return (
    <section
      className="preview-hero preview-container"
      aria-labelledby="preview-title"
    >
      <p className="preview-eyebrow">Rotas / Time / Teams</p>
      <h1 id="preview-title">
        <span>Rota management</span>
        <span>
          that <em>launches</em>
        </span>
        <span>productivity</span>
      </h1>
      <p className="preview-hero-description">
        RocketRota makes scheduling simple, fair and efficient.
        <br className="hidden sm:block" /> Save time, reduce admin and keep your
        team happy.
      </p>
      <div className="preview-hero-actions">
        <PreviewTrialLink />
        <a href="#product" className="preview-button preview-button-secondary">
          Explore the product
        </a>
      </div>
      <p className="preview-trial-note">
        <CheckIcon size={16} aria-hidden="true" />
        14-day free trial. No credit card required.
      </p>
    </section>
  )
}
