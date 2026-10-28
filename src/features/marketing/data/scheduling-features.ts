import type { MarketingFeaturePageContent } from "../types"

export const schedulingFeaturePages = {
  "rota-planning": {
    navTitle: "Rota planning",
    headline: ["Less planning.", "More possibility."],
    description:
      "Build the week in minutes. Bring your shifts, people and locations together in one clear rota.",
    workflowTitle: "A calmer way to plan the week.",
    workflowDescription:
      "From the first shift to the final publish, give every part of your week a little more clarity.",
    workflowItems: [
      {
        title: "See the whole week",
        description:
          "Plan by day and zone, assign the right people and keep busy services easy to scan.",
      },
      {
        title: "Make the changes that matter",
        description:
          "Drag staff into shifts, spot gaps and reuse the patterns that already work for your team.",
      },
      {
        title: "Publish with confidence",
        description:
          "Share the finished rota so everyone can find their shifts, without another spreadsheet or message thread.",
      },
    ],
    proofItems: [
      "Drag-and-drop planning",
      "Reusable templates",
      "Multiple zones",
      "Published staff views",
    ],
  },
  "time-tracking": {
    navTitle: "Time tracking",
    headline: ["Every shift.", "Right on time."],
    description:
      "Simple clocking for your team. A clear, live picture of attendance for the people running the day.",
    workflowTitle: "Keep the day moving.",
    workflowDescription:
      "Connect clock activity to the rota, so planned shifts and actual attendance stay in the same conversation.",
    workflowItems: [
      {
        title: "Make clocking straightforward",
        description:
          "Staff clock in and out against their scheduled shifts, with location settings that fit your workplace.",
      },
      {
        title: "See who is here",
        description:
          "Follow live attendance, upcoming starts and entries that need attention from one manager view.",
      },
      {
        title: "Catch the exceptions",
        description:
          "Review late starts, forgotten clock-outs and unusual entries before they become extra admin.",
      },
    ],
    proofItems: [
      "Live attendance",
      "Location clocking rules",
      "Manager overrides",
      "Missed clock-out handling",
    ],
  },
  timesheets: {
    navTitle: "Timesheets",
    headline: ["Hours made clear.", "Admin made lighter."],
    description:
      "Bring scheduled shifts and recorded hours together. Review the week, resolve exceptions and get ready for payroll.",
    workflowTitle: "From clocked time to a clearer week.",
    workflowDescription:
      "Keep the context behind every entry, with review tools that make the next step obvious.",
    workflowItems: [
      {
        title: "Bring the hours together",
        description:
          "Review recorded time alongside scheduled shifts, grouped by employee and date.",
      },
      {
        title: "Resolve what needs attention",
        description:
          "Spot missing records, review exceptions and make manager adjustments in one focused workflow.",
      },
      {
        title: "Keep everyone informed",
        description:
          "Give staff a clear view of their own time while managers prepare a tidy weekly review.",
      },
    ],
    proofItems: [
      "Scheduled and actual hours",
      "Weekly review",
      "Manager adjustments",
      "Employee views",
    ],
  },
} satisfies Record<
  "rota-planning" | "time-tracking" | "timesheets",
  MarketingFeaturePageContent
>
