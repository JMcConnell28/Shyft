import type { HelpPage } from "@/features/help-center/types"

const managerSetupPages: ReadonlyArray<HelpPage> = [
  {
    slug: "managers/getting-started",
    title: "Set up your workplace",
    description:
      "A starting checklist for locations, people, permissions and your first published rota.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "3 min",
    keywords: [
      "onboarding",
      "owner",
      "admin",
      "supervisor",
      "roles",
      "permissions",
      "team",
      "settings",
    ],
    relatedSlugs: [
      "managers/locations-and-rota-settings",
      "managers/manage-employees",
      "managers/create-first-rota",
    ],
    sections: [
      {
        type: "steps",
        title: "Set up in this order",
        items: [
          "Ask the owner or an administrator to check the workplace details in Settings → General and add the required locations.",
          "Set up the staff groups and zones used for planning. Check each location's rota preferences and closing times.",
          "Add or link employee profiles, assign their locations and staff groups, and invite people to join their accounts.",
          "Create and review a weekly rota, then publish it so employees can see it.",
          "If you use attendance, activate clocking for the location, check its station and explain the clocking process to staff.",
        ],
      },
      {
        type: "bullets",
        title: "Choose the right level of access",
        items: [
          "Owners and administrators manage workplace configuration and account administration. Sensitive company, pay and billing controls need the relevant admin access.",
          "Managers can plan and publish rotas, review attendance, manage announcements and approve eligible staff requests within their permitted locations.",
          "Supervisors have a staffing overview and attendance controls, but fewer administration and rota publishing permissions than managers.",
          "Employees use their own published shifts, clocking, timesheets, announcements and available shift requests. They do not need a manager dashboard.",
        ],
      },
      {
        type: "callout",
        title: "A guide does not grant access",
        body: "The controls you see depend on your role, location access and enabled features. Ask the workplace owner or an administrator if a required action is unavailable.",
      },
    ],
  },
  {
    slug: "managers/staffing-dashboard",
    title: "Use the manager dashboard",
    description:
      "Check daily staffing, live attendance and items that need a manager's attention.",
    categoryId: "managers",
    audience: "For managers",
    readingTime: "3 min",
    keywords: [
      "manager dashboard",
      "personal",
      "switch",
      "staff scheduled",
      "working now",
      "needs attention",
      "date picker",
    ],
    relatedSlugs: [
      "managers/manual-attendance-corrections",
      "managers/automatic-clock-outs",
      "employees/my-dashboard",
    ],
    sections: [
      {
        type: "steps",
        title: "Review staffing for a day",
        items: [
          "Open Dashboard and choose Manager dashboard. Use My dashboard when you want to check your own shifts.",
          "Choose the location and date. Use the previous and next day controls or Today to return to the current day.",
          "Check Staff scheduled and the attendance summary, then use the employee search, zone and status filters in Today's team.",
          "Use the planning section to open an existing rota or create the next one when your role allows it.",
        ],
      },
      {
        type: "paragraphs",
        title: "Understand the scope",
        body: [
          "The staffing list follows your selected date and location. Today's attendance can update while the page is open; a historical date is a view of that day's records.",
          "Needs attention covers unresolved items across all your permitted locations. Its total is not restricted to the staffing date or location you selected.",
        ],
      },
      {
        type: "callout",
        title: "An unrecorded arrival is not a clock-in",
        body: "Check with the employee before deciding what happened. Acknowledging an arrival alert records the explanation; it does not create an attendance entry. Use the manual clocking controls if a time record is missing, or review and correct an existing entry.",
      },
    ],
  },
  {
    slug: "managers/locations-and-rota-settings",
    title: "Manage locations and rota settings",
    description:
      "Configure closing times, staff groups, zones and the preferences used by each location.",
    categoryId: "managers",
    audience: "For managers and administrators",
    readingTime: "3 min",
    keywords: [
      "12 hour",
      "24 hour",
      "time format",
      "default zone",
      "staff group",
      "closing",
      "publish notifications",
      "editing",
    ],
    relatedSlugs: [
      "managers/split-and-overnight-shifts",
      "managers/templates-and-copying",
      "managers/clocking-setup",
    ],
    sections: [
      {
        type: "steps",
        title: "Check the location setup",
        items: [
          "With the appropriate settings access, open Settings → Locations to manage location details and each day's closing time.",
          "For a closing time after midnight, check the next-day setting so the shift finishes on the intended date.",
          "Open Settings → Rota and select the location. Review its default zone, time display and input preferences, editing behaviour and publishing options.",
          "Use Review & save to apply rota setting changes. Repeat for other locations that need different preferences.",
        ],
      },
      {
        type: "bullets",
        title: "Groups, zones and publishing preferences",
        items: [
          "Staff groups organise people for planning. Open Settings → Team, choose a location and assign employees to their groups. Use the Groups area and New group to create a group with a name and colour.",
          "Zones describe the area where a shift is worked. Open the Zones area in rota settings to create or rename a zone for the correct location. Check both location access and group assignments if someone is missing from planning.",
          "Editing behaviour includes whether published rotas can be edited and whether deleting shifts needs confirmation.",
          "Publishing preferences control staff notifications and whether rota notes are shown to employees. Review these before publishing sensitive planning notes.",
          "The rota settings also include templates, copying preferences and the workplace's shift swap option.",
        ],
      },
      {
        type: "callout",
        title: "Clocking has its own settings",
        body: "Location timezone, attendance rules, clocking activation and missed clock-out limits are configured under Settings → Clocking. Changing rota display preferences is not the same as changing attendance rules.",
      },
    ],
  },
]

export { managerSetupPages }
