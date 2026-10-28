import type { MarketingFeaturePageContent } from "../types"

export const teamFeaturePages = {
  "team-management": {
    navTitle: "Team management",
    headline: ["Your people.", "All in one place."],
    description:
      "Keep your team organised across roles, groups and locations. Less searching, more time for the people behind every shift.",
    workflowTitle: "A growing team. A simpler setup.",
    workflowDescription:
      "Give everyone a clear place in your organisation, whether you run one venue or several.",
    workflowItems: [
      {
        title: "Bring your people together",
        description:
          "Invite staff and keep employee information in a central team directory.",
      },
      {
        title: "Organise around your workplace",
        description:
          "Group people by team and location so finding the right staff for each shift feels straightforward.",
      },
      {
        title: "Give access intentionally",
        description:
          "Use roles and permissions to keep the right tools in the right hands as your team grows.",
      },
    ],
    proofItems: [
      "Employee directory",
      "Team groups",
      "Multiple locations",
      "Roles and permissions",
    ],
  },
  "manager-dashboard": {
    navTitle: "Manager dashboard",
    headline: ["The whole day.", "One clear view."],
    description:
      "Start with what matters. See today's shifts, attendance and actions together, without moving between different screens.",
    workflowTitle: "A little clarity before the busy starts.",
    workflowDescription:
      "Find your bearings quickly, then go straight to the work that needs you.",
    workflowItems: [
      {
        title: "Know what is happening",
        description:
          "See today's scheduled work and the team behind it, with the context of your selected location.",
      },
      {
        title: "Spot what needs you",
        description:
          "Follow attendance and outstanding actions so important details are easier to catch.",
      },
      {
        title: "Get to the next step",
        description:
          "Move into rota planning, time tracking or timesheets from one connected workspace.",
      },
    ],
    proofItems: [
      "Today's shifts",
      "Attendance overview",
      "Location context",
      "Connected workflows",
    ],
  },
  "staff-updates": {
    navTitle: "Staff updates",
    headline: ["Every update.", "Everyone in the loop."],
    description:
      "Give important updates a place of their own. Keep published rotas, team announcements and useful notes easy to find.",
    workflowTitle: "Keep everyone in the loop.",
    workflowDescription:
      "A shared place for the updates that help your team arrive informed and ready for the day.",
    workflowItems: [
      {
        title: "Share the important details",
        description:
          "Publish announcements and practical notes for the people who need to see them.",
      },
      {
        title: "Make updates easy to find",
        description:
          "Keep team communications alongside the rota and working week, rather than scattered across conversations.",
      },
      {
        title: "Help staff stay up to date",
        description:
          "Give employees a clear view of team announcements and their published schedule.",
      },
    ],
    proofItems: [
      "Team announcements",
      "Published rotas",
      "Important notes",
      "A shared staff view",
    ],
  },
} satisfies Record<
  "team-management" | "manager-dashboard" | "staff-updates",
  MarketingFeaturePageContent
>
