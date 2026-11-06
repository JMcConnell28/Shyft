import type { OrganizationRole } from "@/lib/auth/permissions"
// eslint-disable-next-line no-duplicate-imports
import { roles } from "@/lib/auth/permissions"
import { getOrgCapabilitiesForRole } from "@/lib/auth/workspace-capabilities"

const permissionRoles = [
  "owner",
  "admin",
  "manager",
  "supervisor",
  "employee",
] as const
const roleNames: Record<(typeof permissionRoles)[number], string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  supervisor: "Supervisor",
  employee: "Employee",
}
type PermissionRow = {
  label: string
  access: (role: OrganizationRole) => boolean | string
}
const rolePermissions: Array<PermissionRow> = [
  {
    label: "View rotas",
    access: (role) => getOrgCapabilitiesForRole(role).canViewRota,
  },
  {
    label: "Create, edit and publish rotas",
    access: (role) => getOrgCapabilitiesForRole(role).canManageRota,
  },
  {
    label: "View rota costs",
    access: (role) => getOrgCapabilitiesForRole(role).canViewRotaCosts,
  },
  {
    label: "Approve shift swaps and cover",
    access: (role) => getOrgCapabilitiesForRole(role).canUpdateRota,
  },
  {
    label: "Make manual clock-ins and clock-outs",
    access: (role) => getOrgCapabilitiesForRole(role).canManageTimeClock,
  },
  {
    label: "View and edit other employees’ timesheets",
    access: (role) => getOrgCapabilitiesForRole(role).canManageTimesheets,
  },
  { label: "View own timesheets", access: () => true },
  {
    label: "Invite staff and choose their locations",
    access: (role) => getOrgCapabilitiesForRole(role).canInviteTeamMembers,
  },
  {
    label: "Approve or deny organization join requests",
    access: (role) =>
      roles[role].authorize({ teamMember: ["approve"] }).success,
  },
  {
    label: "Manage employees, roles, pay and location access",
    access: (role) => roles[role].authorize({ member: ["update"] }).success,
  },
  {
    label: "Manage staff groups",
    access: (role) => getOrgCapabilitiesForRole(role).canManageTeamMembers,
  },
  {
    label: "Manage announcements",
    access: (role) =>
      role === "manager"
        ? "Managed locations"
        : getOrgCapabilitiesForRole(role).canManageAnnouncements,
  },
  {
    label: "Change organization and clock settings",
    access: (role) => getOrgCapabilitiesForRole(role).canManageSettings,
  },
  {
    label: "Create locations",
    access: (role) => getOrgCapabilitiesForRole(role).canManageLocations,
  },
  {
    label: "Delete locations",
    access: (role) => roles[role].authorize({ location: ["delete"] }).success,
  },
  {
    label: "Delete organization",
    access: (role) =>
      roles[role].authorize({ organization: ["delete"] }).success,
  },
  {
    label: "Manage billing and subscriptions",
    access: (role) => role === "owner",
  },
  {
    label: "Use support tickets",
    access: (role) => getOrgCapabilitiesForRole(role).canUseSupport,
  },
  { label: "View this permissions page", access: (role) => role === "owner" },
]

export { permissionRoles, roleNames, rolePermissions }
