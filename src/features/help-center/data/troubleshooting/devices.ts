import type { HelpPage } from "@/features/help-center/types"

const deviceTroubleshootingPages: ReadonlyArray<HelpPage> = [
  {
    slug: "troubleshooting/clocking-problems",
    title: "Troubleshoot a clocking station or failed punch",
    description:
      "Work through a failed NFC tap, expired clocking page or unexpected attendance status.",
    categoryId: "troubleshooting",
    audience: "For employees and managers",
    readingTime: "3 min",
    keywords: [
      "NFC",
      "tag",
      "expired",
      "invalid link",
      "not reading",
      "phone",
      "failed",
      "already clocked in",
    ],
    relatedSlugs: [
      "employees/clock-in-and-out",
      "managers/clocking-setup",
      "employees/forgotten-clock-outs",
    ],
    sections: [
      {
        type: "steps",
        title: "Try a fresh station tap",
        items: [
          "Check that the phone has an internet connection and can read NFC tags. Hold its NFC reading area close to the registered workplace station.",
          "Open the fresh link from the tap. Do not reuse an old browser tab, saved link, copied link or screenshot as a replacement for a station tap.",
          "Check the signed-in account, workplace and location. Follow any sign-in or access instruction, then tap the station again if the page says the link is invalid or expired.",
          "Check the next clocking action shown, hold the button and wait for the saved confirmation.",
          "If it still fails, note the error and actual working time and ask a manager for a manual correction.",
        ],
      },
      {
        type: "bullets",
        title: "Managers: check the setup and record",
        items: [
          "In Settings → Clocking, check that employee clocking is activated for the location and that the station is registered. Review last-tap and failed-tap information.",
          "Check employee membership and location access. If no shift matches, check the published assignment and working period.",
          "If the employee is already clocked in or sees an unexpected next action, inspect the attendance history before adding another entry. An open entry may need a corrected finish.",
          "If the station remains unusable, record verified working times with a reason and raise a Support request with the error and station details.",
        ],
      },
    ],
  },
  {
    slug: "troubleshooting/notifications",
    title: "Notifications are not arriving",
    description:
      "Check device permissions, app preferences and whether the event sends a notification.",
    categoryId: "troubleshooting",
    audience: "For everyone",
    readingTime: "2 min",
    keywords: [
      "push",
      "blocked",
      "permission denied",
      "iOS",
      "iPhone",
      "reminder",
      "email",
      "spam",
    ],
    relatedSlugs: [
      "account/notifications",
      "account/install-the-app",
      "employees/forgotten-clock-outs",
    ],
    sections: [
      {
        type: "steps",
        title: "Check the receiving device",
        items: [
          "On that device, open Account → Preferences and check Notifications on this device.",
          "If permission was denied, allow notifications in the browser or operating system settings, then return to RocketRota to check the setup again.",
          "On iPhone or iPad, open the app from its Home Screen icon after installing it through Safari. Enable notifications from the installed app.",
          "Check Focus or Do Not Disturb settings, connectivity and whether you are using the same browser or installed app where you enabled push.",
        ],
      },
      {
        type: "bullets",
        title: "Check what should have been sent",
        items: [
          "Announcement pushes require the account's Announcement notifications preference and an audience that includes you. Authors do not get their own new-announcement push.",
          "Edits, pins and poll activity do not send a fresh new-announcement push. Rota publication notifications depend on the location's publishing settings.",
          "Clock-out reminders follow the location's configured limits. The entry may already have been closed before a reminder is delivered or opened.",
          "For an expected email, check the account address and junk folder. Open the app to check the latest information even if the notification is missing.",
        ],
      },
    ],
  },
]

export { deviceTroubleshootingPages }
