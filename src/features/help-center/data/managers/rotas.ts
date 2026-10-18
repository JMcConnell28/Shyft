import type { HelpPage } from "@/features/help-center/types"

const managerRotaPages: ReadonlyArray<HelpPage> = [
  {
    slug: "managers/create-first-rota",
    title: "Create and save a rota",
    description:
      "Build a weekly rota from a blank week, an earlier rota or a saved template.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "3 min",
    keywords: ["new rota", "draft", "drag", "assign", "budget", "cost", "save"],
    relatedSlugs: [
      "managers/publish-and-update-rota",
      "managers/templates-and-copying",
      "tips/weekly-rota-checklist",
    ],
    sections: [
      {
        type: "steps",
        title: "Build the week",
        items: [
          "Select Create rota from the dashboard or rotas area. Choose the correct location and week; weeks run Monday to Sunday.",
          "Start blank, copy an available previous week or choose a saved template. If the week already has a rota, open that rota instead.",
          "Add the required shifts with their start and finish times, staff groups and zones. Assign employees using the editor's staff controls or drag and drop.",
          "Check coverage by day and by person. Resolve overlapping assignments and check split shifts, closing times and any rota notes.",
          "Select Review & save and confirm the changes. Publish the rota separately when it is ready for employees.",
        ],
      },
      {
        type: "paragraphs",
        title: "Planning hours and cost",
        body: [
          "Use the editor's hours and, where your role permits, cost and budget controls to review the plan. Cost figures depend on the employee pay details configured for your workplace.",
          "A copied rota or template is a starting point. Confirm that the people and times still suit this week; do not assume their availability has been checked automatically.",
        ],
      },
      {
        type: "callout",
        title: "Save and publish are separate",
        body: "A saved draft is for planning. Employees see the published version, so complete the publishing step when you are ready to share the rota.",
      },
    ],
  },
  {
    slug: "managers/publish-and-update-rota",
    title: "Publish and update a rota",
    description:
      "Share a completed rota with staff and publish later changes clearly.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "3 min",
    keywords: [
      "republish",
      "PDF",
      "download",
      "notify",
      "email",
      "draft",
      "editing after publish",
    ],
    relatedSlugs: [
      "tips/weekly-rota-checklist",
      "managers/locations-and-rota-settings",
      "account/notifications",
    ],
    sections: [
      {
        type: "steps",
        title: "Publish the week",
        items: [
          "Check the location and week, assignments, shift times, coverage and notes.",
          "Use Review & save to finish saving any editor changes.",
          "Use the rota's publish action and check the confirmation. Staff notifications follow the location's saved publishing preferences.",
          "Check the published result and tell the team about any important context they need for the week.",
        ],
      },
      {
        type: "steps",
        title: "Change a published rota",
        items: [
          "Open the same rota and make the required changes. Editing must be allowed by the location's settings and your role.",
          "Review and save your changes, then publish the updated version so staff can see it.",
          "Tell affected employees about short-notice changes and ask them to check the latest published rota.",
        ],
      },
      {
        type: "callout",
        title: "Printed copies and notifications",
        body: "A PDF export is a snapshot and will not update after another publish. Push and email delivery depend on publishing settings and the employee's notification setup; publishing successfully does not prove that every employee has read the change.",
      },
    ],
  },
]

export { managerRotaPages }
