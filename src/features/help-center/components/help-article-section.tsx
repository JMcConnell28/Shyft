import type { HelpSection } from "@/features/help-center/types"

function HelpSectionContent({ section }: { section: HelpSection }) {
  switch (section.type) {
    case "paragraphs":
      return (
        <div className="mt-3 space-y-4">
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )
    case "steps":
      return (
        <>
          {section.intro ? <p className="mt-3">{section.intro}</p> : null}
          <ol className="mt-4 space-y-4">
            {section.items.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-sm font-extrabold text-[#2457d6]"
                >
                  {index + 1}
                </span>
                <span>
                  <span className="sr-only">Step {index + 1}: </span>
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </>
      )
    case "bullets":
      return (
        <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-[#2457d6]">
          {section.items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      )
    case "callout":
      return <p className="mt-2">{section.body}</p>
  }
}

function HelpArticleSection({
  section,
  id,
}: {
  section: HelpSection
  id: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={
        section.type === "callout"
          ? "scroll-mt-6 rounded-xl border border-[#bed1fb] bg-[#eef5ff] p-5"
          : "scroll-mt-6"
      }
    >
      <h2
        id={`${id}-heading`}
        className="text-xl font-extrabold tracking-tight text-[#16346e] sm:text-2xl"
      >
        {section.title}
      </h2>
      <div className="text-base leading-8 text-[#40577f]">
        <HelpSectionContent section={section} />
      </div>
    </section>
  )
}

export { HelpArticleSection }
