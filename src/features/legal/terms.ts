import type { TermsSection } from "@/features/legal/types"
import { serviceTermsSections } from "@/features/legal/content/service-terms"
import { dataTermsSections } from "@/features/legal/content/data-terms"
import { generalTermsSections } from "@/features/legal/content/general-terms"

const termsVersion = "2026-10-23"
const termsEffectiveDate = "23 October 2026"
const termsLastUpdated = "23 October 2026"

const termsSections: ReadonlyArray<TermsSection> = [
  ...serviceTermsSections,
  ...dataTermsSections,
  ...generalTermsSections,
]

export { termsEffectiveDate, termsLastUpdated, termsSections, termsVersion }
