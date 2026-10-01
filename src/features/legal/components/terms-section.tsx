import type { TermsSection } from "@/features/legal/types"

function TermsSectionContent({
  section,
  number,
}: {
  section: TermsSection
  number: number
}) {
  const headingId = `terms-${number}`

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
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}

export { TermsSectionContent }
