import type { HelpCategory, HelpPage } from "@/features/help-center/types"
import { employeePages } from "@/features/help-center/data/employee-guides"
import { accountPages } from "@/features/help-center/data/account-guides"
import { managerPages } from "@/features/help-center/data/manager-guides"
import { rotaTipPages } from "@/features/help-center/data/rota-tip-guides"
import { troubleshootingPages } from "@/features/help-center/data/troubleshooting-guides"

const helpCategories: ReadonlyArray<HelpCategory> = [
  {
    id: "employees",
    title: "For employees",
    description:
      "Your shifts, clocking, timesheets, swaps and workplace updates.",
    pages: employeePages,
  },
  {
    id: "managers",
    title: "For managers",
    description:
      "Plan rotas, manage your team, review attendance and prepare payroll.",
    pages: managerPages,
  },
  {
    id: "account",
    title: "Account & access",
    description:
      "Joining, signing in, installing the app and choosing notifications.",
    pages: accountPages,
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description:
      "Resolve missing shifts, clocking problems and notification issues.",
    pages: troubleshootingPages,
  },
  {
    id: "rota-tips",
    title: "Rota tips",
    description:
      "Practical guidance for building clearer, fairer and more reliable rotas.",
    pages: rotaTipPages,
  },
]

const helpPages: ReadonlyArray<HelpPage> = helpCategories.flatMap(
  (category) => category.pages
)

function getHelpPage(slug?: Array<string>): HelpPage | undefined {
  const normalizedSlug = slug?.join("/") ?? ""

  return helpPages.find((page) => page.slug === normalizedSlug)
}

function getRelatedHelpPages(page: HelpPage): ReadonlyArray<HelpPage> {
  const suggestedPages = (page.relatedSlugs ?? []).flatMap((slug) => {
    const relatedPage = helpPages.find((candidate) => candidate.slug === slug)
    return relatedPage ? [relatedPage] : []
  })
  const categoryPages = helpPages.filter(
    (candidate) => candidate.categoryId === page.categoryId
  )
  const uniquePages = new Map(
    [...suggestedPages, ...categoryPages].map((candidate) => [
      candidate.slug,
      candidate,
    ])
  )
  uniquePages.delete(page.slug)
  return [...uniquePages.values()].slice(0, 3)
}

export { getHelpPage, getRelatedHelpPages, helpCategories, helpPages }
