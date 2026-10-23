import { Link } from "@tanstack/react-router"

import { MarketingFooter } from "@/features/marketing/components/marketing-footer"
import { MarketingHeader } from "@/features/marketing/components/marketing-header"
import { LegalDocumentSectionContent } from "@/features/legal/components/legal-document-section"
import type { LegalDocumentSection } from "@/features/legal/types"

type LegalDocumentPageProps = {
  documentId: "terms" | "privacy"
  title: string
  introduction: string
  effectiveDate: string
  lastUpdated: string
  sections: ReadonlyArray<LegalDocumentSection>
  draftNotice?: string
}

function LegalDocumentPage({
  documentId,
  title,
  introduction,
  effectiveDate,
  lastUpdated,
  sections,
  draftNotice,
}: LegalDocumentPageProps) {
  return (
    <div className="min-h-svh bg-[#f8fbff] text-[#18316a]">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <MarketingHeader />
      </div>
      <main className="mx-auto max-w-4xl px-4 pt-10 pb-20 sm:px-6 sm:pt-16">
        <div className="rounded-[28px] border border-[#dce8ff] bg-white px-5 py-8 shadow-[0_18px_50px_rgba(38,80,160,0.06)] sm:px-10 sm:py-12">
          <p className="text-xs font-bold tracking-[0.18em] text-[#2c69ff] uppercase">
            RocketRota legal
          </p>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-[#64789e]">
            Effective: {effectiveDate} · Last updated: {lastUpdated}
          </p>
          <p className="mt-7 max-w-2xl text-base leading-8 text-[#50668d]">
            {introduction}
          </p>
          {draftNotice && (
            <aside
              aria-label="Draft status"
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950"
            >
              <strong>Pre-launch draft. </strong>
              {draftNotice}
            </aside>
          )}
          <div className="mt-10 space-y-9 border-t border-[#e2eaf9] pt-10">
            {sections.map((section, index) => (
              <LegalDocumentSectionContent
                key={section.title}
                section={section}
                number={index + 1}
                documentId={documentId}
              />
            ))}
          </div>
          <nav
            aria-label="Related information"
            className="mt-12 flex flex-wrap gap-5 border-t border-[#e2eaf9] pt-7 text-sm font-semibold text-[#1264e9]"
          >
            {documentId === "privacy" ? (
              <Link to="/terms" className="underline underline-offset-4">
                Terms and Conditions
              </Link>
            ) : (
              <Link to="/privacy" className="underline underline-offset-4">
                Privacy Policy
              </Link>
            )}
            <Link to="/pricing" className="underline underline-offset-4">
              View pricing
            </Link>
            <Link to="/help" className="underline underline-offset-4">
              Visit the Help Centre
            </Link>
          </nav>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}

export { LegalDocumentPage }
