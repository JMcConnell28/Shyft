type HelpCategoryId =
  | "managers"
  | "employees"
  | "account"
  | "troubleshooting"
  | "rota-tips"

type HelpCategoryFilter = HelpCategoryId | "all"

type HelpSection =
  | {
      type: "paragraphs"
      title: string
      body: ReadonlyArray<string>
    }
  | {
      type: "steps"
      title: string
      intro?: string
      items: ReadonlyArray<string>
    }
  | {
      type: "bullets"
      title: string
      items: ReadonlyArray<string>
    }
  | {
      type: "callout"
      title: string
      body: string
    }

type HelpPage = {
  slug: string
  title: string
  description: string
  categoryId: HelpCategoryId
  audience: string
  readingTime: string
  keywords?: ReadonlyArray<string>
  relatedSlugs?: ReadonlyArray<string>
  sections: ReadonlyArray<HelpSection>
}

type HelpCategory = {
  id: HelpCategoryId
  title: string
  description: string
  pages: ReadonlyArray<HelpPage>
}

export type {
  HelpCategory,
  HelpCategoryId,
  HelpCategoryFilter,
  HelpPage,
  HelpSection,
}
