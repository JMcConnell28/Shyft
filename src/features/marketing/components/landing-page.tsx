import { LandingHero } from "./landing-hero"
import { LandingPageShell } from "./landing-page-shell"
import { LandingRotaImage } from "./landing-rota-image"
import { MarketingHeader } from "./marketing-header"
import { PreviewClosing } from "./landing-preview/preview-closing"
import { MarketingFooter } from "./marketing-footer"
import { PreviewWorkflow } from "./landing-preview/preview-workflow"

function LandingPage({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean
}) {
  return (
    <LandingPageShell>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-top bg-no-repeat opacity-95"
          style={{ backgroundImage: "url('/brand/landing-background.png')" }}
        />
        <div className="absolute inset-x-0 top-0 h-80 bg-linear-to-b from-white/70 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-svh w-full max-w-[1280px] flex-col px-5 pt-5 pb-12 sm:px-6 lg:px-8">
          <MarketingHeader
            activePage="home"
            isAuthenticated={isAuthenticated}
          />
          <LandingHero />
          <LandingRotaImage />
        </div>
      </section>

      <main>
        <PreviewWorkflow />
        <PreviewClosing />
      </main>
      <MarketingFooter />
    </LandingPageShell>
  )
}

export { LandingPage }
