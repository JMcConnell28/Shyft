import { PreviewClosing } from "./preview-closing"
import { PreviewHeader } from "./preview-header"
import { PreviewFooter } from "./preview-footer"
import { PreviewHero } from "./preview-hero"
import { PreviewProduct } from "./preview-product"
import { PreviewWorkflow } from "./preview-workflow"

import "../../styles/landing-preview.css"
import "../../styles/landing-preview-sections.css"
import "../../styles/landing-preview-navigation.css"
import "../../styles/landing-preview-responsive.css"

export function LandingPreviewPage({
  isAuthenticated,
}: {
  isAuthenticated: boolean
}) {
  return (
    <div className="landing-preview">
      <a href="#main-content" className="preview-skip-link">
        Skip to content
      </a>
      <PreviewHeader isAuthenticated={isAuthenticated} />
      <main id="main-content">
        <PreviewHero />
        <PreviewProduct />
        <PreviewWorkflow />
        <PreviewClosing />
      </main>
      <PreviewFooter />
    </div>
  )
}
