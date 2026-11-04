import { privacyOverviewSections } from "@/features/legal/content/privacy-overview"
import { privacyProcessingSections } from "@/features/legal/content/privacy-processing"
import { privacyRightsSections } from "@/features/legal/content/privacy-rights"
import type { LegalDocumentSection } from "@/features/legal/types"

const privacyEffectiveDate = "23 October 2026"
const privacyLastUpdated = "30 October 2026"
const privacyDraftNotice =
  "Final provider, retention and backup arrangements are still being confirmed. This notice will be completed before launch."

const privacySections: ReadonlyArray<LegalDocumentSection> = [
  ...privacyOverviewSections,
  ...privacyProcessingSections,
  ...privacyRightsSections,
]

export {
  privacyDraftNotice,
  privacyEffectiveDate,
  privacyLastUpdated,
  privacySections,
}
