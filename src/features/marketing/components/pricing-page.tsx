import { LandingPageShell } from "./landing-page-shell"
import { MarketingPageHero } from "./marketing-page-hero"
import { PricingCalculator } from "./pricing-calculator"
import { PricingPlan } from "./pricing-plan"
import { PricingFaq } from "./pricing-faq"
import { PreviewClosing } from "./landing-preview/preview-closing"
import { MarketingFooter } from "./marketing-footer"
import "../styles/marketing-pages.css"
import "../styles/pricing-page.css"

function PricingPage() {
  return (
    <LandingPageShell>
      <MarketingPageHero
        activePage="pricing"
        eyebrow="Pricing"
        title={
          <>
            Simple pricing.
            <br />
            <em>Room to grow.</em>
          </>
        }
        description="One plan for your whole organisation. Pay for the people using RocketRota, with unlimited locations included."
        secondaryAction={
          <a
            href="#calculator"
            className="preview-button preview-button-secondary"
          >
            Calculate your price
          </a>
        }
      >
        <PricingPlan />
      </MarketingPageHero>
      <main>
        <PricingCalculator />
        <PricingFaq />
        <PreviewClosing />
      </main>
      <MarketingFooter />
    </LandingPageShell>
  )
}

export { PricingPage }
