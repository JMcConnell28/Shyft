import type { HelpPage } from "@/features/help-center/types"

const rotaTipPages: readonly HelpPage[] = [
  {
    slug: "tips/weekly-rota-checklist",
    title: "Weekly rota checklist",
    description:
      "A simple manager checklist for reviewing the week before the rota goes live.",
    categoryId: "rota-tips",
    audience: "Rota tips",
    readingTime: "3 min",
    popular: true,
    sections: [
      {
        type: "bullets",
        title: "Before you publish",
        items: [
          "Are peak trading periods covered by enough people?",
          "Are opening and closing responsibilities clearly covered?",
          "Have new starters been paired with experienced staff?",
          "Are any staff members overloaded compared with their usual hours?",
          "Are events, deliveries, bookings or known busy periods reflected in the rota?",
          "Have you checked the rota from the employee's point of view?",
        ],
      },
      {
        type: "callout",
        title: "Quick trick",
        body: "Read the rota once by day, then once by person. The first pass catches business gaps; the second catches fairness issues.",
      },
    ],
  },
  {
    slug: "tips/build-fairer-rotas",
    title: "Build fairer rotas",
    description:
      "Practical ways to make rota planning feel balanced and easier for the team.",
    categoryId: "rota-tips",
    audience: "Rota tips",
    readingTime: "4 min",
    sections: [
      {
        type: "paragraphs",
        title: "Fair does not always mean identical",
        body: [
          "A fair rota balances business needs, contracted hours, availability, skills and unpopular shifts.",
          "The goal is not to give everyone the exact same week. The goal is to make the pattern explainable and consistent.",
        ],
      },
      {
        type: "bullets",
        title: "Ways to improve fairness",
        items: [
          "Rotate late finishes and weekend shifts where possible.",
          "Avoid giving the same person the hardest pattern every week.",
          "Keep experienced cover on busy shifts, but avoid relying on one person too heavily.",
          "Give staff as much notice as possible when shifts change.",
          "Use notes for context so decisions are easier to understand later.",
        ],
      },
    ],
  },
]

export { rotaTipPages }
