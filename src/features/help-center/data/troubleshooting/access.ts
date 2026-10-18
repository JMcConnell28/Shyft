import type { HelpPage } from "@/features/help-center/types"

const accessTroubleshootingPages: ReadonlyArray<HelpPage> = [
  {
    slug: "troubleshooting/missing-rota-or-access",
    title: "A rota, workplace or control is missing",
    description:
      "Check account membership, published shifts, role permissions and enabled features.",
    categoryId: "troubleshooting",
    audience: "Troubleshooting",
    readingTime: "2 min",
    keywords: [
      "blank",
      "empty",
      "cannot see",
      "no shifts",
      "denied",
      "read only",
      "disabled",
      "manager view",
    ],
    relatedSlugs: [
      "account/join-a-workplace",
      "employees/view-your-rota",
      "managers/getting-started",
    ],
    sections: [
      {
        type: "steps",
        title: "Check these first",
        items: [
          "Confirm the account and workplace in Account → Workplaces. If joining is still awaiting approval, contact your manager.",
          "For a missing rota, check the location and week. Ask whether the manager has published that week and assigned the shift to your linked employee profile.",
          "For a missing person in rota planning, an administrator should check their location activity, staff group and Show on rota setting.",
          "For an unavailable control, check the role and location permissions. Supervisors have fewer controls than managers; employees only need their personal view.",
          "If a feature is disabled, check the relevant workplace setting or activation status. An authorised administrator should investigate any billing restriction shown.",
        ],
      },
      {
        type: "callout",
        title: "Do not create a second profile as a workaround",
        body: "A duplicate account or employee profile can make assignments harder to find. Ask your manager to check the existing account link, invitation and membership instead.",
      },
    ],
  },
  {
    slug: "troubleshooting/get-help",
    title: "Get help from your manager or Support",
    description:
      "Find the right person and include the details needed to resolve a problem.",
    categoryId: "troubleshooting",
    audience: "For everyone",
    readingTime: "2 min",
    keywords: [
      "contact",
      "ticket",
      "support request",
      "report bug",
      "error",
      "name correction",
      "pay query",
    ],
    relatedSlugs: [
      "employees/forgotten-clock-outs",
      "troubleshooting/clocking-problems",
      "troubleshooting/missing-rota-or-access",
    ],
    sections: [
      {
        type: "paragraphs",
        title: "Employees: start with your manager",
        body: [
          "Your manager can help with shifts, workplace access, missed clocking, attendance corrections and pay questions. Give them the date, location, actual times and what you expected to see.",
          "If an account detail needs correcting or there is an app problem they cannot resolve, your manager can raise it with Support.",
        ],
      },
      {
        type: "steps",
        title: "Managers: raise a Support request",
        items: [
          "Open Support in the workplace navigation with an owner, administrator or manager account that has support access.",
          "Select New request, describe the issue clearly and include the workplace, affected location and when it happened.",
          "Include the exact error, the steps that caused it, what you expected, and the device and browser. For time problems, include the date and timezone.",
          "Follow the request thread for replies and provide any further information requested there.",
        ],
      },
      {
        type: "callout",
        title: "Share only what is needed",
        body: "Never include passwords, verification codes or password reset links in a support message. If you attach a screenshot, keep it focused on the issue and avoid unrelated personal or payroll details.",
      },
    ],
  },
]

export { accessTroubleshootingPages }
