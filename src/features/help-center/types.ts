type HelpCategoryId = "managers" | "employees" | "rota-tips"

type HelpSection =
  | {
      type: "paragraphs"
      title: string
      body: readonly string[]
    }
  | {
      type: "steps"
      title: string
      intro?: string
      items: readonly string[]
    }
  | {
      type: "bullets"
      title: string
      items: readonly string[]
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
  popular?: boolean
  sections: readonly HelpSection[]
}

type HelpCategory = {
  id: HelpCategoryId
  title: string
  description: string
  pages: readonly HelpPage[]
}

export type { HelpCategory, HelpCategoryId, HelpPage, HelpSection }
