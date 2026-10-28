import { Link } from "@tanstack/react-router"
import { CheckIcon } from "lucide-react"

import { marketingFeaturePages } from "../content"
import type { MarketingFeatureSlug } from "../types"
import { LandingPageShell } from "./landing-page-shell"
import { MarketingPageHero } from "./marketing-page-hero"
import { MarketingWorkflow } from "./marketing-workflow"
import { FeatureVisual } from "./feature-visual"
import { RelatedFeatures } from "./related-features"
import { PreviewClosing } from "./landing-preview/preview-closing"
import { MarketingFooter } from "./marketing-footer"
import "../styles/marketing-pages.css"
import "../styles/feature-previews.css"

function FeaturePage({ feature }: { feature: MarketingFeatureSlug }) {
  const content = marketingFeaturePages[feature]
  return (
    <LandingPageShell>
      <MarketingPageHero
        activePage="features"
        eyebrow={content.navTitle}
        title={
          <>
            {content.headline[0]}
            <br />
            <em>{content.headline[1]}</em>
          </>
        }
        description={content.description}
        secondaryAction={
          <Link
            to="/pricing"
            className="preview-button preview-button-secondary"
          >
            View pricing
          </Link>
        }
      >
        <FeatureVisual feature={feature} />
      </MarketingPageHero>
      <main>
        <ul
          className="marketing-capabilities"
          aria-label={`${content.navTitle} features`}
        >
          {content.proofItems.map((item) => (
            <li key={item}>
              <CheckIcon size={14} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <MarketingWorkflow
          title={content.workflowTitle}
          description={content.workflowDescription}
          items={content.workflowItems}
        />
        <RelatedFeatures current={feature} />
        <PreviewClosing />
      </main>
      <MarketingFooter />
    </LandingPageShell>
  )
}

export { FeaturePage }
