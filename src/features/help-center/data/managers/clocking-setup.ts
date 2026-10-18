import type { HelpPage } from "@/features/help-center/types"

const managerClockingSetupPages: ReadonlyArray<HelpPage> = [
  {
    slug: "managers/clocking-setup",
    title: "Set up clocking and attendance rules",
    description:
      "Activate a location, check its NFC station and configure how attendance is reviewed.",
    categoryId: "managers",
    audience: "For managers and administrators",
    readingTime: "3 min",
    keywords: [
      "Time & Attendance",
      "hardware",
      "tag",
      "NFC",
      "timezone",
      "grace",
      "early",
      "late",
      "station",
      "activation",
    ],
    relatedSlugs: [
      "managers/automatic-clock-outs",
      "employees/clock-in-and-out",
      "managers/billing",
    ],
    sections: [
      {
        type: "steps",
        title: "Enable a location when it is ready",
        items: [
          "With the required settings access, open Settings → Clocking and choose the location.",
          "Check the clock-in station registration and the activation panel. Complete activation only when the workplace's station is ready to use.",
          "Read the activation confirmation: enabling employee clocking activates Time & Attendance billing for that location.",
          "Confirm the location timezone, then check the registered station status and recent tap information.",
          "Test a fresh station tap and show staff how to hold the clocking button and wait for confirmation.",
        ],
      },
      {
        type: "bullets",
        title: "Review attendance rules",
        items: [
          "Review the early clock-in allowance, late arrival grace period and late clock-out allowance.",
          "Choose when early arrivals, late arrivals and late finishes should be flagged for review.",
          "Check missed clock-out reminder and closure limits separately. These protect open entries when someone forgets to finish.",
          "Explain that recorded and payable times can differ under the location's rules or a reviewed adjustment.",
        ],
      },
      {
        type: "callout",
        title: "Rota access does not activate clocking",
        body: "Employees can have access to a published rota before the location's clocking service is activated. If the station or activation status looks wrong, resolve that setup before asking staff to use it.",
      },
    ],
  },
  {
    slug: "managers/automatic-clock-outs",
    title: "Configure and review automatic clock-outs",
    description:
      "Set reminder and maximum times, then review estimated finishes before payroll.",
    categoryId: "managers",
    audience: "For managers and administrators",
    readingTime: "4 min",
    keywords: [
      "auto clock out",
      "timer",
      "forgot",
      "missed",
      "15 minutes",
      "2 hours",
      "8 hours",
      "maximum",
      "delay",
      "background job",
    ],
    relatedSlugs: [
      "managers/manual-attendance-corrections",
      "managers/team-timesheets-and-payroll",
      "account/notifications",
    ],
    sections: [
      {
        type: "bullets",
        title: "How the defaults work",
        items: [
          "Scheduled entries: send a reminder 15 minutes after the captured scheduled finish. If still open 2 hours after that finish, close the entry using the scheduled finish as the estimate.",
          "For example, a shift ending at 18:00 is due a reminder at 18:15. If still open at 20:00, it can be closed with an estimated finish of 18:00, awaiting review.",
          "Unscheduled entries: remind the employee 15 minutes before the 8-hour maximum, then close an entry still open at that maximum using the 8-hour point as its estimated finish.",
          "Every automatic clock-out needs manager review. The service checks periodically without employees keeping the app open; push delivery depends on their notification setup.",
        ],
      },
      {
        type: "steps",
        title: "Customise a location's timings",
        items: [
          "With the required settings access, open Settings → Clocking, choose the location and find Missed clock-outs.",
          "Set Clock-out reminder and Scheduled automatic clock-out in minutes after the scheduled finish. Keep the reminder earlier than the automatic cutoff.",
          "Set Unscheduled shift maximum and Unscheduled reminder. The reminder is the number of minutes before the maximum, so it must be shorter than the allowed shift duration.",
          "Save each timing by leaving the field or pressing Enter. Check that the change has saved and resolve any validation message.",
        ],
      },
      {
        type: "steps",
        title: "Review an automatic finish",
        items: [
          "Open the item in Needs attention or the team's timesheets and check the estimated finish, scheduled shift and review reason.",
          "Confirm with the employee when they actually finished. Approve the entry as recorded only if it is accurate; otherwise correct the date and time with a reason.",
          "Complete outstanding attendance reviews before exporting the week for payroll.",
        ],
      },
      {
        type: "callout",
        title: "Timing changes affect open entries",
        body: "New location limits apply to existing open entries on a later background check. Reducing a limit can make an already-running entry overdue immediately. Choose sensible limits for overnight and unscheduled work, and correct any estimate that does not match the actual work.",
      },
    ],
  },
]

export { managerClockingSetupPages }
