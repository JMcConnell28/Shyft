import type { HelpPage } from "@/features/help-center/types"

const accountDevicePages: ReadonlyArray<HelpPage> = [
  {
    slug: "account/face-id-and-fingerprint",
    title: "Set up Face ID, fingerprint or a passkey",
    description:
      "Add a convenient device sign-in method and manage saved sign-ins.",
    categoryId: "account",
    audience: "For everyone",
    readingTime: "2 min",
    keywords: [
      "biometric",
      "touch ID",
      "PIN",
      "password manager",
      "security",
      "remove passkey",
    ],
    relatedSlugs: ["account/sign-in-and-password", "account/install-the-app"],
    sections: [
      {
        type: "steps",
        title: "Add a saved sign-in",
        items: [
          "Sign in and open Account → Face ID & fingerprint.",
          "Select Set up on this device and follow your browser or device's instructions.",
          "Confirm using the available device method, such as face recognition, fingerprint, a PIN or a password manager.",
          "Check that the saved sign-in appears in your account. Use the passkey option at sign-in when your device offers it.",
        ],
      },
      {
        type: "paragraphs",
        title: "Manage devices and fallback access",
        body: [
          "Your device handles biometric verification; RocketRota does not receive your face or fingerprint. Available methods depend on the browser, device and credential provider.",
          "You can remove a saved sign-in from the account's list when you no longer want it used. Your password remains a sign-in option if the device method is unavailable.",
        ],
      },
      {
        type: "callout",
        title: "Use a device you control",
        body: "Set up saved sign-ins on your own trusted device. If a passkey prompt does not appear, try the password option and check the device's browser or password manager support.",
      },
    ],
  },
  {
    slug: "account/notifications",
    title: "Choose your notification preferences",
    description:
      "Enable device notifications for updates and missed clock-out reminders.",
    categoryId: "account",
    audience: "For everyone",
    readingTime: "2 min",
    keywords: [
      "push",
      "reminder",
      "permission",
      "announcements",
      "rota published",
      "mute",
      "preferences",
    ],
    relatedSlugs: [
      "account/install-the-app",
      "troubleshooting/notifications",
      "employees/forgotten-clock-outs",
    ],
    sections: [
      {
        type: "steps",
        title: "Enable notifications on this device",
        items: [
          "On the device you want to receive notifications, sign in and open Account → Preferences.",
          "Use Notifications on this device and allow notifications when your browser or operating system asks.",
          "Check the separate Announcement notifications preference for workplace announcement pushes.",
          "Repeat device setup on each phone or browser you want to use. For iPhone or iPad, install and open RocketRota from the Home Screen before enabling push.",
        ],
      },
      {
        type: "bullets",
        title: "What affects delivery",
        items: [
          "Device notification permission applies to that device or browser. The announcement preference is an account preference.",
          "New rota notifications depend on the manager's publishing preferences. New announcements depend on the selected audience and your preferences.",
          "Missed clock-out reminders follow your location's timings. Notifications being disabled does not prevent an overdue entry from being closed automatically.",
          "Focus modes, blocked browser permissions, connectivity and device settings can affect what you receive.",
        ],
      },
      {
        type: "callout",
        title: "Check the app for the current information",
        body: "A notification is a prompt to check RocketRota. Read the latest published rota or announcement in the app rather than relying on an older notification preview.",
      },
    ],
  },
  {
    slug: "account/install-the-app",
    title: "Install RocketRota on your phone or computer",
    description:
      "Add the web app to your Home Screen or desktop for quicker access.",
    categoryId: "account",
    audience: "For everyone",
    readingTime: "2 min",
    keywords: [
      "PWA",
      "iOS",
      "iPhone",
      "iPad",
      "Android",
      "Safari",
      "Chrome",
      "home screen",
      "offline",
    ],
    relatedSlugs: ["account/notifications", "account/face-id-and-fingerprint"],
    sections: [
      {
        type: "steps",
        title: "Install from your browser",
        items: [
          "Sign in and open Account → RocketRota app.",
          "Select Install RocketRota if offered. If the page points you to the browser menu, use that browser's install option.",
          "On iPhone or iPad, open RocketRota in Safari, use Share → Add to Home Screen, then open the new Home Screen icon.",
          "On supported Android or desktop browsers, use the install or add-to-home-screen option offered in the browser menu.",
          "Open the installed app, sign in if needed and enable notifications on that device if you want push updates.",
        ],
      },
      {
        type: "callout",
        title: "Keep a connection for work actions",
        body: "Installing the app makes it easier to open; it does not make clocking, saving changes or loading current shifts fully offline. Wait for confirmation that an action succeeded. Cached content is not proof that a new clocking action or edit has been saved.",
      },
    ],
  },
]

export { accountDevicePages }
