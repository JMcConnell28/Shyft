import type { HelpPage } from "@/features/help-center/types"

const employeeSchedulePages: ReadonlyArray<HelpPage> = [
  {
    slug: "employees/my-dashboard",
    title: "Use your personal dashboard",
    description:
      "Find your next shift, this week's work and your current clocking status.",
    categoryId: "employees",
    audience: "For employees",
    readingTime: "2 min",
    keywords: ["home", "my dashboard", "working now", "next shift"],
    relatedSlugs: ["employees/view-your-rota", "employees/clock-in-and-out"],
    sections: [
      {
        type: "steps",
        title: "Start your day",
        items: [
          "Open Dashboard and check that you are in the correct workplace.",
          "Check your next shift, location and start time, then review the week's shifts and hours.",
          "Check your clocking status and read any announcements relevant to your team.",
        ],
      },
      {
        type: "paragraphs",
        title: "Personal and manager views",
        body: [
          "Employees see their personal dashboard. Managers and supervisors can switch between My dashboard and Manager dashboard to see their own shifts or the staffing overview.",
          "A scheduled shift does not automatically clock you in. Use your workplace's clocking station to record when you actually start and finish.",
        ],
      },
      {
        type: "callout",
        title: "Something is missing?",
        body: "Check your workplace and the published rota first. Ask your manager to check your employee profile, location access and shift assignment if a shift still does not appear.",
      },
    ],
  },
  {
    slug: "employees/view-your-rota",
    title: "View your rota and shift details",
    description:
      "Find your published shifts, check the correct week and understand changes.",
    categoryId: "employees",
    audience: "For employees",
    readingTime: "2 min",
    keywords: ["schedule", "roster", "hours", "PDF", "shift notes"],
    relatedSlugs: [
      "employees/shift-swaps",
      "troubleshooting/missing-rota-or-access",
    ],
    sections: [
      {
        type: "steps",
        title: "Find the right shift",
        items: [
          "Open Rotas and choose the location and week you want to view. Rota weeks run Monday to Sunday.",
          "Find your name and check each shift's date, start, finish and zone. A zone is the area where you will work.",
          "Read any visible rota notes and check both working periods if you have a split shift.",
          "Check the latest published rota again after your manager tells you about a change.",
        ],
      },
      {
        type: "paragraphs",
        title: "Published rotas and updates",
        body: [
          "Employees see published rotas. A manager may still be working on a draft that you cannot see yet. Saving a draft is separate from publishing it.",
          "A downloaded or printed PDF is a snapshot. Return to RocketRota for the latest published version rather than relying on an old copy.",
        ],
      },
      {
        type: "callout",
        title: "Need a different shift?",
        body: "Use Shift swaps if your workplace has enabled it, or contact your manager. Do not assume a request or an informal agreement has changed your assigned shift.",
      },
    ],
  },
  {
    slug: "employees/my-timesheet",
    title: "Check your timesheet",
    description:
      "Review recorded working time, payable hours and entries that need a correction.",
    categoryId: "employees",
    audience: "For employees",
    readingTime: "2 min",
    keywords: ["pay", "wages", "hours", "attendance", "history"],
    relatedSlugs: [
      "employees/forgotten-clock-outs",
      "employees/clock-in-and-out",
    ],
    sections: [
      {
        type: "steps",
        title: "Review your week",
        items: [
          "Open Timesheets and select the week you want to check. If you also have team access, choose My timesheet for your own records.",
          "Open the day's entries and compare the recorded clock-in and clock-out times with when you actually worked.",
          "Check the scheduled, worked and payable hours, including any review markers or adjustment reasons.",
          "Send your manager the date, location, correct times and reason if something needs changing.",
        ],
      },
      {
        type: "paragraphs",
        title: "Why hours can differ",
        body: [
          "Scheduled hours describe the rota. Worked hours come from attendance records. Payable time may follow your location's clocking rules or a reviewed adjustment, so these totals can differ.",
          "An automatic clock-out is an estimate awaiting review. Ask your manager to check it if you finished at a different time. Employees cannot make their own backdated corrections.",
        ],
      },
      {
        type: "callout",
        title: "Questions about your pay",
        body: "Your manager or payroll team can explain your workplace's pay rules and review a disputed entry. Check the timesheet before the workplace's payroll deadline.",
      },
    ],
  },
]

export { employeeSchedulePages }
