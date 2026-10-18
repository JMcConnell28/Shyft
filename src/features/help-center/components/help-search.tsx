import { SearchIcon, XIcon } from "lucide-react"

import type { HelpCategoryFilter } from "@/features/help-center/types"
import { helpCategories } from "@/features/help-center/source"
import { cn } from "@/lib/utils"

type HelpSearchProps = {
  query: string
  onQueryChange: (query: string) => void
  categoryId: HelpCategoryFilter
  onCategoryChange: (categoryId: HelpCategoryFilter) => void
}

const filters = [
  { id: "all", title: "All guides" },
  ...helpCategories.map(({ id, title }) => ({ id, title })),
] satisfies Array<{ id: HelpCategoryFilter; title: string }>

function HelpSearch({
  query,
  onQueryChange,
  categoryId,
  onCategoryChange,
}: HelpSearchProps) {
  return (
    <div role="search" aria-label="Help guides" className="mt-7">
      <label htmlFor="help-search" className="sr-only">
        Search help guides
      </label>
      <div className="flex items-center gap-3 rounded-xl border border-[#cbdaf4] bg-white px-4 focus-within:border-[#2457d6] focus-within:ring-2 focus-within:ring-[#2457d6]/15">
        <SearchIcon
          aria-hidden="true"
          className="size-5 shrink-0 text-[#65799f]"
        />
        <input
          id="help-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search shifts, clocking, payroll…"
          className="h-12 min-w-0 flex-1 appearance-none bg-transparent text-base text-[#16346e] outline-none placeholder:text-[#65799f] [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#65799f] hover:bg-[#edf4ff] focus-visible:outline-2 focus-visible:outline-[#2457d6]"
          >
            <XIcon aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter guides by section"
      >
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            aria-pressed={categoryId === filter.id}
            onClick={() => onCategoryChange(filter.id)}
            className={cn(
              "min-h-10 rounded-full border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2457d6]",
              categoryId === filter.id
                ? "border-[#2457d6] bg-[#2457d6] text-white"
                : "border-[#dfe8f8] bg-white text-[#506994] hover:border-[#a9c3f7] hover:text-[#2457d6]"
            )}
          >
            {filter.title}
          </button>
        ))}
      </div>
    </div>
  )
}

export { HelpSearch }
