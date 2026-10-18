import { ArrowLeftIcon, ArrowRightIcon, Clock3Icon } from "lucide-react"

import { HelpArticleSection } from "./help-article-section"
import type { HelpPage } from "@/features/help-center/types"
import { getRelatedHelpPages } from "@/features/help-center/source"

function HelpArticle({ page }: { page: HelpPage }) {
  const relatedPages = getRelatedHelpPages(page)

  return (
    <article className="max-w-[760px]">
      <a
        href="/help"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#2457d6] hover:underline"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        All help guides
      </a>
      <header className="mt-7 border-b border-[#dfe8f8] pb-7">
        <p className="text-sm font-bold text-[#2457d6]">{page.audience}</p>
        <h1 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight text-[#16346e] sm:text-4xl">
          {page.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-[#65799f]">
          {page.description}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-[#65799f]">
          <Clock3Icon aria-hidden="true" className="size-4" />
          {page.readingTime} read
        </p>
      </header>

      <nav
        aria-label="On this page"
        className="mt-6 border-l-2 border-[#cbdaf4] pl-4"
      >
        <p className="text-sm font-bold text-[#16346e]">On this page</p>
        <ul className="mt-2 space-y-2">
          {page.sections.map((section, index) => (
            <li key={section.title}>
              <a
                href={`#section-${index + 1}`}
                className="text-sm leading-6 text-[#506994] underline-offset-4 hover:text-[#2457d6] hover:underline"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-9 py-9">
        {page.sections.map((section, index) => (
          <HelpArticleSection
            key={section.title}
            section={section}
            id={`section-${index + 1}`}
          />
        ))}
      </div>

      {relatedPages.length > 0 ? (
        <footer className="border-t border-[#dfe8f8] pt-7">
          <h2 className="text-xl font-extrabold tracking-tight text-[#16346e]">
            Related guides
          </h2>
          <div className="mt-3 divide-y divide-[#dfe8f8]">
            {relatedPages.map((relatedPage) => (
              <a
                key={relatedPage.slug}
                href={`/help/${relatedPage.slug}`}
                className="group flex items-center justify-between gap-4 py-4 text-sm leading-6 font-bold text-[#2457d6] hover:underline"
              >
                {relatedPage.title}
                <ArrowRightIcon
                  aria-hidden="true"
                  className="size-4 shrink-0"
                />
              </a>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-[#65799f]">
            Still need help?{" "}
            <a
              href="/help/troubleshooting/get-help"
              className="font-bold text-[#2457d6] underline underline-offset-4"
            >
              Contact your manager or Support
            </a>
            .
          </p>
        </footer>
      ) : null}
    </article>
  )
}

export { HelpArticle }
