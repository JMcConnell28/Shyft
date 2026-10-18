import type {
  HelpCategory,
  HelpCategoryFilter,
  HelpPage,
  HelpSection,
} from "@/features/help-center/types"

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
}

function getSectionText(section: HelpSection): string {
  switch (section.type) {
    case "paragraphs":
      return `${section.title} ${section.body.join(" ")}`
    case "steps":
      return `${section.title} ${section.intro ?? ""} ${section.items.join(" ")}`
    case "bullets":
      return `${section.title} ${section.items.join(" ")}`
    case "callout":
      return `${section.title} ${section.body}`
  }
}

function matchesHelpSearch(
  page: HelpPage,
  terms: ReadonlyArray<string>
): boolean {
  if (terms.length === 0) return true
  const text = normalizeSearchText(
    [
      page.title,
      page.description,
      page.audience,
      ...(page.keywords ?? []),
      ...page.sections.map(getSectionText),
    ].join(" ")
  )
  const words = text.split(" ")
  return terms.every((term) => words.some((word) => word.startsWith(term)))
}

function filterHelpCategories(
  categories: ReadonlyArray<HelpCategory>,
  query: string,
  categoryId: HelpCategoryFilter
): ReadonlyArray<HelpCategory> {
  const terms = normalizeSearchText(query).split(" ").filter(Boolean)
  return categories
    .filter((category) => categoryId === "all" || category.id === categoryId)
    .map((category) => ({
      ...category,
      pages: category.pages.filter((page) => matchesHelpSearch(page, terms)),
    }))
    .filter((category) => category.pages.length > 0)
}

export { filterHelpCategories }
