import { LegalDocumentPage } from "@/features/legal/components/legal-document-page"
import {
  privacyDraftNotice,
  privacyEffectiveDate,
  privacyLastUpdated,
  privacySections,
} from "@/features/legal/privacy"

function PrivacyPage() {
  return (
    <LegalDocumentPage
      documentId="privacy"
      title="Privacy Policy"
      introduction="How RocketRota handles personal information, how this differs from your workplace's responsibilities, and how to ask questions or exercise your rights."
      effectiveDate={privacyEffectiveDate}
      lastUpdated={privacyLastUpdated}
      sections={privacySections}
      draftNotice={privacyDraftNotice}
    />
  )
}

export { PrivacyPage }
