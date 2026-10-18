import { describe, expect, it } from "vitest"

import { filterHelpCategories } from "./help-search"
import {
  getHelpPage,
  getRelatedHelpPages,
  helpCategories,
  helpPages,
} from "@/features/help-center/source"

function searchSlugs(
  query: string,
  categoryId: Parameters<typeof filterHelpCategories>[2] = "all"
) {
  return filterHelpCategories(helpCategories, query, categoryId).flatMap(
    (category) => category.pages.map((page) => page.slug)
  )
}

describe("help discovery", () => {
  it("makes every article available without a search or role filter", () => {
    expect(searchSlugs("")).toEqual(helpPages.map((page) => page.slug))
  })

  it("searches article body text and normalises punctuation and case", () => {
    expect(searchSlugs("18:15 AUTOMATIC")).toContain(
      "managers/automatic-clock-outs"
    )
    expect(searchSlugs("auto-clock-out")).toContain(
      "employees/forgotten-clock-outs"
    )
  })

  it("matches help terminology through keywords", () => {
    expect(searchSlugs("backdate")).toContain(
      "managers/manual-attendance-corrections"
    )
    expect(searchSlugs("PWA")).toEqual(["account/install-the-app"])
  })

  it("combines role filtering with all search terms", () => {
    expect(searchSlugs("clocking", "employees").length).toBeGreaterThan(0)
    expect(
      searchSlugs("clocking", "employees").every(
        (slug) => getHelpPage(slug.split("/"))?.categoryId === "employees"
      )
    ).toBe(true)
    expect(searchSlugs("Sage", "employees")).toEqual([])
    expect(searchSlugs("unfindablephrase")).toEqual([])
  })
})

describe("help catalogue integrity", () => {
  it("keeps existing guide URLs working", () => {
    for (const slug of [
      "employees/view-your-rota",
      "employees/clock-in-and-out",
      "managers/getting-started",
      "managers/create-first-rota",
      "managers/publish-and-update-rota",
      "tips/weekly-rota-checklist",
      "tips/build-fairer-rotas",
    ]) {
      expect(getHelpPage(slug.split("/"))?.slug).toBe(slug)
    }
    expect(getHelpPage(["does-not-exist"])).toBeUndefined()
  })

  it("has unique URLs, consistent categories and valid related links", () => {
    expect(new Set(helpPages.map((page) => page.slug)).size).toBe(
      helpPages.length
    )
    for (const category of helpCategories) {
      for (const page of category.pages) {
        expect(page.categoryId).toBe(category.id)
        expect(page.sections.length).toBeGreaterThan(0)
        for (const slug of page.relatedSlugs ?? []) {
          expect(
            getHelpPage(slug.split("/")),
            `${page.slug} links to ${slug}`
          ).toBeDefined()
        }
      }
    }
  })

  it("prioritises relevant related guides without self-links or duplicates", () => {
    for (const page of helpPages) {
      const related = getRelatedHelpPages(page).map(
        (candidate) => candidate.slug
      )
      expect(related).not.toContain(page.slug)
      expect(new Set(related).size).toBe(related.length)
      expect(related.length).toBeLessThanOrEqual(3)
      if (page.relatedSlugs?.[0]) expect(related[0]).toBe(page.relatedSlugs[0])
    }
  })
})
