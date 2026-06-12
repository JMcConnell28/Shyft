import { ArrowRightIcon, Clock3Icon } from "lucide-react"

import { getRelatedHelpPages } from "@/features/help-center/source"
import type { HelpPage, HelpSection } from "@/features/help-center/types"

function HelpArticle({ page }: { page: HelpPage }) {
  const relatedPages = getRelatedHelpPages(page)

  return (
    <article>
      <header className="border-b border-[#dfe8f8] pb-8">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#2c69ff]">
          {page.audience}
        </p>
        <h1 className="mt-4 max-w-[760px] text-4xl font-extrabold leading-tight tracking-tight text-[#16346e] sm:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 max-w-[680px] text-base leading-8 text-[#65799f]">
          {page.description}
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#dfe8f8] bg-white px-3 py-1 text-sm font-semibold text-[#65799f]">
          <Clock3Icon className="size-4" />
          {page.readingTime}
        </div>
      </header>

      <div className="space-y-8 py-9">
        {page.sections.map((section) => (
          <HelpArticleSection key={section.title} section={section} />
        ))}
      </div>

      {relatedPages.length > 0 ? (
        <footer className="border-t border-[#dfe8f8] pt-8">
          <h2 className="text-xl font-extrabold tracking-tight text-[#16346e]">
            Related guides
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedPages.map((relatedPage) => (
              <a
                key={relatedPage.slug}
                href={`/help/${relatedPage.slug}`}
                className="group rounded-xl border border-[#dfe8f8] bg-white p-4 shadow-[0_10px_28px_rgba(38,80,160,0.05)] transition hover:border-[#bed1fb]"
              >
                <span className="block text-sm font-extrabold text-[#16346e]">
                  {relatedPage.title}
                </span>
                <span className="mt-2 block text-sm leading-6 text-[#65799f]">
                  {relatedPage.description}
                </span>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2457d6]">
                  Open guide
                  <ArrowRightIcon className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
          </div>
        </footer>
      ) : null}
    </article>
  )
}

function HelpArticleSection({ section }: { section: HelpSection }) {
  if (section.type === "paragraphs") {
    return (
      <section>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#16346e]">
          {section.title}
        </h2>
        <div className="mt-4 space-y-4 text-base leading-8 text-[#40577f]">
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    )
  }

  if (section.type === "steps") {
    return (
      <section>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#16346e]">
          {section.title}
        </h2>
        {section.intro ? (
          <p className="mt-3 text-base leading-8 text-[#40577f]">
            {section.intro}
          </p>
        ) : null}
        <ol className="mt-4 space-y-3">
          {section.items.map((item, index) => (
            <li key={item} className="flex gap-3 text-base leading-7 text-[#40577f]">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-sm font-extrabold text-[#2457d6]">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </section>
    )
  }

  if (section.type === "bullets") {
    return (
      <section>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#16346e]">
          {section.title}
        </h2>
        <ul className="mt-4 space-y-3">
          {section.items.map((item) => (
            <li key={item} className="flex gap-3 text-base leading-7 text-[#40577f]">
              <span className="mt-2 size-2 shrink-0 rounded-full bg-[#2c69ff]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <aside className="rounded-xl border border-[#bed1fb] bg-[#eef5ff] p-5">
      <h2 className="text-lg font-extrabold tracking-tight text-[#16346e]">
        {section.title}
      </h2>
      <p className="mt-2 text-base leading-7 text-[#40577f]">{section.body}</p>
    </aside>
  )
}

export { HelpArticle }
