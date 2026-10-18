import type { HelpPage } from "@/features/help-center/types"

const managerAttendancePages: ReadonlyArray<HelpPage> = [
  {
    slug: "managers/manual-attendance-corrections",
    title: "Record missed punches and correct attendance",
    description:
      "Enter an actual past start or finish, explain a correction and resolve review items.",
    categoryId: "managers",
    audience: "For managers and supervisors",
    readingTime: "3 min",
    keywords: [
      "backdate",
      "manual clock in",
      "manual clock out",
      "time input",
      "date input",
      "approve",
      "review",
      "forgot",
    ],
    relatedSlugs: [
      "managers/automatic-clock-outs",
      "managers/team-timesheets-and-payroll",
      "managers/staffing-dashboard",
    ],
    sections: [
      {
        type: "steps",
        title: "Add a missed clock-in or clock-out",
        items: [
          "Open the employee's attendance controls in the manager dashboard or time tracking area. Your role must allow attendance changes for that location.",
          "Choose the appropriate manual clock-in or clock-out action and enter the actual date and time. You can choose a time in the past.",
          "Check the date carefully for overnight work. The manual input uses the timezone of your device, so take extra care when managing another timezone.",
          "Enter a clear reason, check the employee and location, then save. Future times, overlapping entries and a finish before the start are rejected.",
        ],
      },
      {
        type: "steps",
        title: "Resolve an existing review item",
        items: [
          "Open the attendance entry and read why it needs attention, including any automatic clock-out or unusual timing flag.",
          "Check the actual working times with the employee. Approve the existing record if it is correct, or use the correction controls to record the right times and explanation.",
          "Check the resulting worked and payable times and confirm that the review item has been resolved.",
        ],
      },
      {
        type: "callout",
        title: "Keep a useful explanation",
        body: "Record why the time changed, such as a forgotten clock-out or a verified late finish. Acknowledging an arrival alert alone does not add the missing attendance record. Employees should report corrections to a manager rather than backdate their own entries.",
      },
    ],
  },
  {
    slug: "managers/team-timesheets-and-payroll",
    title: "Review team timesheets and export for Sage",
    description:
      "Resolve open and unreviewed attendance, then download a completed week's payroll file.",
    categoryId: "managers",
    audience: "For managers and payroll administrators",
    readingTime: "3 min",
    keywords: [
      "CSV",
      "Sage",
      "export",
      "payroll",
      "approve",
      "payable",
      "open entries",
      "completed week",
    ],
    relatedSlugs: [
      "managers/manual-attendance-corrections",
      "managers/payroll-details",
      "employees/my-timesheet",
    ],
    sections: [
      {
        type: "steps",
        title: "Review the week",
        items: [
          "Open Timesheets and select Team timesheets if you also have a personal view.",
          "Choose the week and location, then open employee details to compare scheduled, worked and payable time.",
          "Resolve missing finishes, automatic clock-outs and other review flags. Correct inaccurate records with a reason and approve accurate entries that require review.",
          "Check that everyone included in the payroll file has the correct Sage payroll employee reference.",
        ],
      },
      {
        type: "steps",
        title: "Export a completed week",
        items: [
          "Select Export and choose the completed week. If you manage multiple locations, select the location to export.",
          "Resolve any reported open entries, pending attendance reviews or missing payroll references. The export is blocked until these are fixed.",
          "Download the Sage CSV, check the employee references and totals, then follow your payroll team's import process.",
        ],
      },
      {
        type: "callout",
        title: "A file export, not a live payroll sync",
        body: "Sage export is available for completed weeks and locations you are allowed to access. Downloading a file does not import it into Sage. If you correct attendance after exporting, review whether your payroll team needs an updated file and avoid importing the same hours twice.",
      },
    ],
  },
]

export { managerAttendancePages }
