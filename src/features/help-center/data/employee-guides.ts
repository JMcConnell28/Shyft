import type { HelpPage } from "@/features/help-center/types"

const employeePages: readonly HelpPage[] = [
  {
    slug: "employees/view-your-rota",
    title: "View your rota",
    description:
      "Find your shifts, check times and understand what to do if something looks wrong.",
    categoryId: "employees",
    audience: "For employees",
    readingTime: "2 min",
    popular: true,
    sections: [
      {
        type: "steps",
        title: "Check your shifts",
        items: [
          "Log in to RocketRota with the email your workplace invited.",
          "Open your rota or dashboard.",
          "Check each shift date, start time, finish time and working area.",
          "Read any notes attached to the rota or shift.",
          "Tell a manager if a shift is missing, wrong or clashes with something already agreed.",
        ],
      },
      {
        type: "callout",
        title: "Tip",
        body: "Check the rota again after managers announce changes. The latest published rota is the one to follow.",
      },
    ],
  },
  {
    slug: "employees/clock-in-and-out",
    title: "Clock in and out",
    description:
      "Record your working time clearly so managers can review accurate timesheets.",
    categoryId: "employees",
    audience: "For employees",
    readingTime: "3 min",
    popular: true,
    sections: [
      {
        type: "steps",
        title: "Record your shift",
        items: [
          "Open the clock screen before starting work.",
          "Clock in when your shift begins.",
          "Clock out when your shift ends.",
          "If your workplace uses breaks, follow your manager's process for recording them.",
          "Speak to a manager if you forget to clock in or out.",
        ],
      },
      {
        type: "bullets",
        title: "Good habits",
        items: [
          "Clock in from the device or location your workplace expects.",
          "Do not clock in for someone else.",
          "Report mistakes as soon as possible so timesheets stay accurate.",
        ],
      },
    ],
  },
]

export { employeePages }
