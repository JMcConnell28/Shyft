import type { HelpPage } from "@/features/help-center/types"

const managerPlanningPages: ReadonlyArray<HelpPage> = [
  {
    slug: "managers/templates-and-copying",
    title: "Reuse templates and copy rotas",
    description:
      "Save time on repeat weeks while checking the details that change.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "2 min",
    keywords: [
      "duplicate",
      "previous week",
      "copy",
      "saved template",
      "rename",
      "delete",
    ],
    relatedSlugs: [
      "managers/create-first-rota",
      "managers/locations-and-rota-settings",
    ],
    sections: [
      {
        type: "steps",
        title: "Start from an existing pattern",
        items: [
          "Create a rota for the intended location and week.",
          "Choose an available previous rota or a saved template as the starting source.",
          "Review copied shifts, people, zones, dates and notes. Adjust the pattern for this week's staffing and expected workload.",
          "Review and save the draft, then publish when the week is ready.",
        ],
      },
      {
        type: "paragraphs",
        title: "Maintain useful templates",
        body: [
          "Use the rota's template controls to keep a reusable planning pattern. Saved templates and copying preferences can be managed in Settings → Rota for the location.",
          "Give templates names that explain when to use them. Rename or remove outdated templates so the team does not start from an obsolete pattern.",
        ],
      },
      {
        type: "callout",
        title: "Review every copied week",
        body: "Copying does not confirm that an employee can work the new dates. Check availability with your team, overlapping shifts, opening and closing cover, and any notes carried forward.",
      },
    ],
  },
  {
    slug: "managers/split-and-overnight-shifts",
    title: "Plan split, overnight and closing shifts",
    description:
      "Make working periods and finish dates clear when a shift is not a simple daytime block.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "2 min",
    keywords: [
      "midnight",
      "next day",
      "close",
      "closing estimate",
      "two shifts",
      "break",
      "overlap",
    ],
    relatedSlugs: [
      "managers/locations-and-rota-settings",
      "employees/clock-in-and-out",
      "managers/automatic-clock-outs",
    ],
    sections: [
      {
        type: "bullets",
        title: "Choose the right shift pattern",
        items: [
          "Use separate working periods for a split shift and check that each segment has the correct start, finish and assignment.",
          "For an overnight shift, check the finish date as well as the time. A finish after midnight belongs to the following day.",
          "For closing shifts, review the location's daily closing times and any next-day setting before relying on the estimated finish.",
          "Resolve overlapping assignments before saving. A gap between split periods should reflect when the employee is actually away from work.",
        ],
      },
      {
        type: "paragraphs",
        title: "Explain the attendance process",
        body: [
          "Employees should check the matched working period at the clocking station and record each period separately. Follow your workplace's agreed process for breaks.",
          "Automatic clock-out protection uses the attendance entry's captured scheduled finish or the unscheduled maximum. Review the actual finish if closing ran later than planned.",
        ],
      },
      {
        type: "callout",
        title: "Check the whole date",
        body: "When correcting an overnight attendance entry, choose the next day's finish date where appropriate. A finish earlier than the start will be rejected.",
      },
    ],
  },
]

export { managerPlanningPages }
