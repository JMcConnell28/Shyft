import type { HelpPage } from "@/features/help-center/types"

const employeeAttendancePages: ReadonlyArray<HelpPage> = [
  {
    slug: "employees/clock-in-and-out",
    title: "Clock in and out",
    description:
      "Use your workplace's NFC clocking station to record the start and end of work.",
    categoryId: "employees",
    audience: "For employees",
    readingTime: "3 min",
    keywords: [
      "NFC",
      "tag",
      "tap",
      "hold",
      "attendance",
      "early",
      "late",
      "break",
    ],
    relatedSlugs: [
      "employees/forgotten-clock-outs",
      "troubleshooting/clocking-problems",
      "employees/my-timesheet",
    ],
    sections: [
      {
        type: "steps",
        title: "Record your start or finish",
        items: [
          "At the workplace, tap the registered NFC clocking station with your phone. Sign in to the correct RocketRota account if asked.",
          "Check the workplace, location, current status and matched shift. For a split shift, check that the correct working period is selected.",
          "Hold the clock-in or clock-out button until the action completes. Give a reason if the screen asks for one.",
          "Wait for confirmation and check the recorded time and updated status before leaving the page.",
        ],
      },
      {
        type: "paragraphs",
        title: "Early starts, late finishes and unscheduled work",
        body: [
          "Clocking outside your scheduled times can require an explanation or manager review. For an early start, the screen may ask whether payable time should start now or at the scheduled start; choose the option that matches your agreed work.",
          "If no shift is matched, check the location and rota. An unscheduled entry may still be recorded but needs manager review. Clocking does not create a published shift.",
        ],
      },
      {
        type: "bullets",
        title: "During the day",
        items: [
          "Record each working period of a split shift separately. Follow your workplace's process for breaks.",
          "Use a fresh tap at the station when clocking. A saved link, screenshot or copied link may no longer be valid.",
          "If your phone or the station is unavailable, tell a manager your actual start or finish time so they can record a correction.",
        ],
      },
    ],
  },
  {
    slug: "employees/forgotten-clock-outs",
    title: "Forgot to clock in or out?",
    description:
      "Understand reminders, automatic clock-outs and how to get a missed punch corrected.",
    categoryId: "employees",
    audience: "For employees",
    readingTime: "3 min",
    keywords: [
      "timer",
      "running",
      "missed",
      "automatic",
      "auto clock out",
      "backdate",
      "manual",
      "15 minutes",
      "2 hours",
      "8 hours",
    ],
    relatedSlugs: [
      "employees/my-timesheet",
      "account/notifications",
      "managers/manual-attendance-corrections",
    ],
    sections: [
      {
        type: "steps",
        title: "Get the record corrected",
        items: [
          "Check your clocking status and timesheet. If you are finishing work now and are still clocked in, use the workplace station to clock out.",
          "If you forgot to clock in, finished earlier or see an incorrect automatic finish, tell your manager the date, location and actual start and finish times.",
          "Explain what happened. A manager with attendance access can enter a past date and time and record the reason.",
          "Check the corrected entry in your timesheet after it has been reviewed.",
        ],
      },
      {
        type: "bullets",
        title: "Default reminders and limits",
        items: [
          "Scheduled work: a reminder is due 15 minutes after the scheduled finish. If the entry remains open 2 hours after that finish, it is closed automatically using the scheduled finish as an estimate.",
          "Unscheduled work: the default maximum is 8 hours from clock-in, with a reminder 15 minutes before that limit. An entry still open at the limit is closed using that maximum as its estimated finish.",
          "Your workplace can customise these times for each location. Checks run periodically, so reminders and closure may not happen at the exact minute.",
        ],
      },
      {
        type: "callout",
        title: "Automatic finishes need review",
        body: "Automatic clock-outs are flagged for a manager to review. The extra 2-hour window is not automatically added to your paid time. If you worked beyond the estimated finish, ask your manager to record your actual finish. Push reminders also depend on notifications being enabled on your device.",
      },
    ],
  },
]

export { employeeAttendancePages }
