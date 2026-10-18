import type { HelpPage } from "@/features/help-center/types"

const managerPeoplePages: ReadonlyArray<HelpPage> = [
  {
    slug: "managers/manage-employees",
    title: "Manage employee profiles and access",
    description:
      "Keep staff groups, location access and employment status up to date.",
    categoryId: "managers",
    audience: "For managers and administrators",
    readingTime: "3 min",
    keywords: [
      "company",
      "team",
      "add staff",
      "former",
      "offboard",
      "remove",
      "rehire",
      "show on rota",
      "roles",
    ],
    relatedSlugs: [
      "managers/invitations-and-join-requests",
      "managers/payroll-details",
      "managers/getting-started",
    ],
    sections: [
      {
        type: "steps",
        title: "Check an employee's setup",
        items: [
          "With company administration access, open Settings → Company and choose the current employee's profile.",
          "Check their account link, employment details and location activity. Assign the staff groups they should appear under for each location.",
          "Check both location access and Show on rota. Being connected to a location and appearing in rota planning are separate controls.",
          "Review administrative roles carefully. Give people only the access needed for their work.",
        ],
      },
      {
        type: "paragraphs",
        title: "When someone leaves",
        body: [
          "Use Remove employee and read the confirmation. Offboarding revokes workplace and location access and removes the employee from shifts that have not started.",
          "Historical rota, attendance, payroll and billing records are retained. Removing an employee is not a way to erase their working history.",
        ],
      },
      {
        type: "callout",
        title: "Rehiring a former employee",
        body: "Find the person under Former employees and choose at least one location when rehiring. This restores employee-level access; old administrative permissions and removed future shifts are not automatically restored. Check their setup and upcoming assignments again.",
      },
    ],
  },
  {
    slug: "managers/invitations-and-join-requests",
    title: "Invite staff and review join requests",
    description:
      "Connect the right account to an employee without creating duplicate profiles.",
    categoryId: "managers",
    audience: "For managers and administrators",
    readingTime: "2 min",
    keywords: [
      "invite link",
      "pending",
      "approve",
      "reject",
      "membership",
      "duplicate",
      "email",
    ],
    relatedSlugs: ["account/join-a-workplace", "managers/manage-employees"],
    sections: [
      {
        type: "steps",
        title: "Invite and connect an employee",
        items: [
          "An owner or administrator with invitation access can use the team controls to invite staff or share the workplace's staff joining link.",
          "Ask the employee to sign in with the account they intend to use and follow the joining instructions. They may need to verify their email.",
          "Open Settings → Join requests if the joining route requires approval and your role has that permission.",
          "Check the person's identity and match the request to an existing employee profile where appropriate. Confirm the correct locations before approving.",
        ],
      },
      {
        type: "bullets",
        title: "If a person cannot get in",
        items: [
          "Check for a pending request, an invitation sent to another email address or an account linked to a different employee profile.",
          "Do not approve an unfamiliar request just because the person has the joining link. Confirm who they are and which locations they should access.",
          "If the request was rejected or the invitation is no longer usable, check the employee's details before arranging a fresh invitation.",
        ],
      },
      {
        type: "callout",
        title: "Account access and rota assignments are separate",
        body: "Approving access does not automatically assign shifts. Check the employee's staff group, Show on rota setting and published assignments after linking their account.",
      },
    ],
  },
  {
    slug: "managers/payroll-details",
    title: "Maintain pay details and Sage references",
    description:
      "Check the employee details used for rota costs and payroll exports.",
    categoryId: "managers",
    audience: "For managers and administrators",
    readingTime: "3 min",
    keywords: [
      "Sage employee import",
      "CSV",
      "payroll ID",
      "employee reference",
      "rate",
      "compensation",
      "budget",
      "date of birth",
      "wages",
    ],
    relatedSlugs: [
      "managers/team-timesheets-and-payroll",
      "managers/manage-employees",
    ],
    sections: [
      {
        type: "steps",
        title: "Check employee pay and references",
        items: [
          "An authorised company administrator can open the employee in Settings → Company and review the account and payroll details.",
          "Check the compensation information used for planning costs and any date-of-birth details relevant to the configured rate.",
          "Enter or check the Sage payroll employee reference for people included in Sage exports. Keep it consistent with your payroll system.",
          "Review rota cost estimates after changing pay details. Ask your payroll team to confirm the rates your workplace should use.",
        ],
      },
      {
        type: "steps",
        title: "Import Sage employee references",
        items: [
          "Use Import Sage employees in the company area and upload the supported Sage employee export.",
          "Review the preview and employee matches before confirming updates. Resolve missing or ambiguous matches first.",
          "Confirm the reference updates, then check the affected employee profiles and payroll export readiness.",
        ],
      },
      {
        type: "callout",
        title: "What this import does",
        body: "The Sage employee import updates payroll references on matched existing employees. It does not create a new team or replace employee access, roles and pay setup. Timesheet export is a separate step.",
      },
    ],
  },
]

export { managerPeoplePages }
