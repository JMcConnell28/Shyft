import { useState } from "react"
import { ArrowRightIcon } from "lucide-react"

import { HelpSearch } from "./help-search"
import type { HelpCategoryFilter } from "@/features/help-center/types"
import { helpCategories } from "@/features/help-center/source"
import { filterHelpCategories } from "@/features/help-center/utils/help-search"

function HelpCenterHome() {
  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState<HelpCategoryFilter>("all")
  const categories = filterHelpCategories(helpCategories, query, categoryId)
  const resultCount = categories.reduce(
    (total, category) => total + category.pages.length,
    0
  )

  function clearFilters() {
    setQuery("")
    setCategoryId("all")
  }

  return (
    <div>
      <header>
        <p className="text-sm font-bold text-[#2457d6]">
          RocketRota Help Centre
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#16346e] sm:text-4xl">
          How can we help?
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-[#65799f]">
          Find your next step, whether you’re checking a shift, managing a team
          or sorting out a missed clock-out.
        </p>
      </header>

      <HelpSearch
        query={query}
        onQueryChange={setQuery}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
      />

      <p role="status" className="mt-5 text-sm text-[#65799f]">
        {resultCount} {resultCount === 1 ? "guide" : "guides"}
        {query.trim()
          ? ` matching “${query.trim()}”`
          : " to help you use RocketRota"}
      </p>

      {categories.length > 0 ? (
        <div className="mt-7 space-y-10">
          {categories.map((category) => (
            <section
              key={category.id}
              aria-labelledby={`category-${category.id}`}
            >
              <h2
                id={`category-${category.id}`}
                className="text-xl font-extrabold tracking-tight text-[#16346e]"
              >
                {category.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#65799f]">
                {category.description}
              </p>
              <div className="mt-3 grid gap-x-7 sm:grid-cols-2">
                {category.pages.map((page) => (
                  <a
                    key={page.slug}
                    href={`/help/${page.slug}`}
                    className="group flex items-start gap-3 border-b border-[#dfe8f8] py-4 text-[#16346e] transition-colors hover:text-[#2457d6] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2457d6]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-6 font-bold">
                        {page.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-[#65799f]">
                        {page.description}
                      </span>
                    </span>
                    <ArrowRightIcon
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-[#65799f] group-hover:text-[#2457d6]"
                    />
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-xl border border-[#dfe8f8] bg-white p-6">
          <h2 className="font-bold text-[#16346e]">No matching guides</h2>
          <p className="mt-2 text-sm leading-6 text-[#65799f]">
            Try a shorter search, choose another section or browse all guides.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded text-sm font-bold text-[#2457d6] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Clear search and filters
          </button>
        </div>
      )}

      <footer className="mt-10 border-t border-[#dfe8f8] pt-6 text-sm leading-6 text-[#65799f]">
        Still need a hand?{" "}
        <a
          href="/help/troubleshooting/get-help"
          className="font-bold text-[#2457d6] underline underline-offset-4"
        >
          Find out who to contact
        </a>
        .
      </footer>
    </div>
  )
}

export { HelpCenterHome }
