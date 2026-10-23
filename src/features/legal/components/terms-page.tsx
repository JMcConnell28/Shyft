import { LegalDocumentPage } from "@/features/legal/components/legal-document-page"
import {
  termsEffectiveDate,
  termsLastUpdated,
  termsSections,
} from "@/features/legal/terms"

function TermsPage() {
  return (
    <LegalDocumentPage
      documentId="terms"
      title="Terms and Conditions"
      introduction="These terms govern business use of RocketRota and include the data-processing terms for workforce information. Please read them before creating a workplace, joining a team or purchasing a subscription."
      effectiveDate={termsEffectiveDate}
      lastUpdated={termsLastUpdated}
      sections={termsSections}
    />
  )
}

export { TermsPage }
