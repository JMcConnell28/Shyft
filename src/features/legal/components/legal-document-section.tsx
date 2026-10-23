import type { LegalDocumentSection } from "@/features/legal/types"

function LegalDocumentSectionContent({
  section,
  number,
  documentId,
}: {
  section: LegalDocumentSection
  number: number
  documentId: string
}) {
  const headingId = `${documentId}-${number}`

  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="font-heading text-xl font-extrabold tracking-tight"
      >
        {number}. {section.title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-[#52698f] sm:text-base sm:leading-8">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {section.links && <LegalDocumentLinks links={section.links} />}
        {section.subsections?.map((subsection, index) => (
          <section
            key={subsection.title}
            aria-labelledby={`${headingId}-${index + 1}`}
            className="pt-4"
          >
            <h3
              id={`${headingId}-${index + 1}`}
              className="font-heading font-bold text-[#18316a]"
            >
              {number}.{index + 1} {subsection.title}
            </h3>
            <div className="mt-2 space-y-3">
              {subsection.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {subsection.links && (
                <LegalDocumentLinks links={subsection.links} />
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

function LegalDocumentLinks({
  links,
}: {
  links: NonNullable<LegalDocumentSection["links"]>
}) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className="font-semibold text-[#1264e9] underline underline-offset-4"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export { LegalDocumentSectionContent }
