type TermsSubsection = {
  title: string
  paragraphs: ReadonlyArray<string>
}

type TermsSection = TermsSubsection & {
  subsections?: ReadonlyArray<TermsSubsection>
}

export type { TermsSection }
