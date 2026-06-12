import type { HelpPage } from "@/features/help-center/types"

const managerPages: readonly HelpPage[] = [
  {
    slug: "managers/getting-started",
    title: "Set up your workplace",
    description:
      "Create the basic structure managers need before building the first rota.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "4 min",
    popular: true,
    sections: [
      {
        type: "paragraphs",
        title: "Before you start",
        body: [
          "RocketRota works best when your workplace, locations, staff groups and rota zones match how your team actually operates day to day.",
          "Set up the basics once, then each rota starts from a clean and familiar structure.",
        ],
      },
      {
        type: "steps",
        title: "Recommended setup order",
        items: [
          "Create your workplace and check the workplace name is clear for staff.",
          "Add the locations you rota separately, such as each venue or site.",
          "Create staff groups that match your teams, for example Front of house, Bar team, Kitchen and Management.",
          "Add staff members to the right group so the rota is easier to scan.",
          "Create your first rota and keep it as a draft until every shift has been checked.",
        ],
      },
      {
        type: "callout",
        title: "Tip",
        body: "Use staff groups for how managers think while planning. Use zones for where work happens on the rota.",
      },
    ],
  },
  {
    slug: "managers/create-first-rota",
    title: "Create your first rota",
    description:
      "Build a weekly rota, add shifts and assign the right people to each working area.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "5 min",
    popular: true,
    sections: [
      {
        type: "steps",
        title: "Build the week",
        intro: "Start with the structure of the week before assigning staff.",
        items: [
          "Open Rota and choose the location you want to plan.",
          "Create a new rota for the correct week.",
          "Add shifts for each day, using zones to show where the shift takes place.",
          "Drag staff from the team list into shifts when the shift pattern looks right.",
          "Review the week for missing cover, overlapping assignments and unusual gaps.",
        ],
      },
      {
        type: "bullets",
        title: "What to check before publishing",
        items: [
          "Every key zone has enough cover for busy periods.",
          "No one has been assigned to clashing shifts.",
          "Opening and closing shifts are covered by people with the right experience.",
          "Notes are added where managers or staff need extra context.",
        ],
      },
      {
        type: "callout",
        title: "Quick trick",
        body: "Plan demand first, people second. Add the shifts the business needs, then assign staff once the shape of the week is clear.",
      },
    ],
  },
  {
    slug: "managers/publish-and-update-rota",
    title: "Publish and update a rota",
    description:
      "Understand drafts, published rotas and what to do when the week changes.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "3 min",
    popular: true,
    sections: [
      {
        type: "paragraphs",
        title: "Drafts and published rotas",
        body: [
          "A draft rota is only for managers while the week is still being planned.",
          "Publishing makes the rota ready for staff to view. If the week changes, update the rota carefully so staff always know which version to follow.",
        ],
      },
      {
        type: "steps",
        title: "Publish confidently",
        items: [
          "Check the rota from left to right, day by day.",
          "Look for unassigned shifts or staff who appear in the wrong zone.",
          "Add notes for shift changes, events or anything unusual.",
          "Publish once the rota is ready for the team.",
          "If changes are needed later, make the update and let the affected staff know what changed.",
        ],
      },
      {
        type: "callout",
        title: "Best practice",
        body: "Avoid publishing too early if the rota is still moving. Staff trust the rota more when published changes are intentional.",
      },
    ],
  },
]

export { managerPages }
