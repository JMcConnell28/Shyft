type LegalDocumentLink = {
  label: string
  href: string
}

type LegalDocumentSubsection = {
  title: string
  paragraphs: ReadonlyArray<string>
  links?: ReadonlyArray<LegalDocumentLink>
}

type LegalDocumentSection = LegalDocumentSubsection & {
  subsections?: ReadonlyArray<LegalDocumentSubsection>
}

type TermsSection = LegalDocumentSection

export type { LegalDocumentSection, TermsSection }
