import { employeePages } from "@/features/help-center/data/employee-guides"
import { managerPages } from "@/features/help-center/data/manager-guides"
import { rotaTipPages } from "@/features/help-center/data/rota-tip-guides"
import type { HelpCategory, HelpPage } from "@/features/help-center/types"

const helpCategories: readonly HelpCategory[] = [
  {
    id: "managers",
    title: "For managers",
    description:
      "Set up RocketRota, build weekly rotas and keep your team aligned.",
    pages: managerPages,
  },
  {
    id: "employees",
    title: "For employees",
    description:
      "Check shifts, understand published rotas and record working time.",
    pages: employeePages,
  },
  {
    id: "rota-tips",
    title: "Rota tips",
    description:
      "Practical guidance for building clearer, fairer and more reliable rotas.",
    pages: rotaTipPages,
  },
]

const helpPages: readonly HelpPage[] = helpCategories.flatMap(
  (category) => category.pages,
)
const popularHelpPages: readonly HelpPage[] = helpPages.filter(
  (page) => page.popular,
)

function getHelpPage(slug?: string[]): HelpPage | undefined {
  const normalizedSlug = slug?.join("/") ?? ""

  return helpPages.find((page) => page.slug === normalizedSlug)
}

function getRelatedHelpPages(page: HelpPage): readonly HelpPage[] {
  return helpPages
    .filter(
      (candidate) =>
        candidate.categoryId === page.categoryId &&
        candidate.slug !== page.slug,
    )
    .slice(0, 3)
}

export { getHelpPage, getRelatedHelpPages, helpCategories, helpPages, popularHelpPages }
