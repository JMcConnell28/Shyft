import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements } from "better-auth/plugins/organization/access"

const organizationActions = ["view", ...defaultStatements.organization] as const
const memberActions = ["view", ...defaultStatements.member] as const
const invitationActions = [...defaultStatements.invitation, "read"] as const
const teamActions = ["view", ...defaultStatements.team] as const

const rotaActions = [
  "view",
  "create",
  "update",
  "publish",
  "delete",
  "viewCosts",
] as const

const shiftActions = ["view", "create", "update", "delete", "assign"] as const

const locationActions = ["view", "create", "update", "delete"] as const

const teamMemberActions = ["view", "invite", "update", "remove"] as const
const announcementActions = ["view", "create", "update", "archive"] as const

const statements = {
  organization: organizationActions,
  member: memberActions,
  invitation: invitationActions,
  team: teamActions,
  ac: defaultStatements.ac,
  rota: rotaActions,
  shift: shiftActions,
  location: locationActions,
  teamMember: teamMemberActions,
  announcement: announcementActions,
} as const

const ac = createAccessControl(statements)

const owner = ac.newRole({
  organization: [...organizationActions],
  member: [...memberActions],
  invitation: [...invitationActions],
  team: [...teamActions],
  ac: [...defaultStatements.ac],
  rota: [...rotaActions],
  shift: [...shiftActions],
  location: [...locationActions],
  teamMember: [...teamMemberActions],
  announcement: [...announcementActions],
})

const admin = ac.newRole({
  organization: ["view", "update"],
  member: [...memberActions],
  invitation: [...invitationActions],
  team: [...teamActions],
  ac: [...defaultStatements.ac],
  rota: [...rotaActions],
  shift: [...shiftActions],
  location: ["view", "create", "update"],
  teamMember: [...teamMemberActions],
  announcement: [...announcementActions],
})

const manager = ac.newRole({
  organization: ["view"],
  member: ["view"],
  invitation: ["read"],
  team: ["view"],
  ac: ["read"],
  rota: ["view", "create", "update", "publish", "viewCosts"],
  shift: [...shiftActions],
  location: ["view"],
  teamMember: ["view"],
  announcement: [...announcementActions],
})

const supervisor = ac.newRole({
  organization: ["view"],
  member: ["view"],
  invitation: ["read"],
  team: ["view"],
  ac: ["read"],
  rota: ["view"],
  shift: ["view", "update"],
  location: ["view"],
  teamMember: ["view"],
  announcement: ["view"],
})

const employee = ac.newRole({
  organization: ["view"],
  member: ["view"],
  invitation: ["read"],
  team: ["view"],
  ac: ["read"],
  rota: ["view"],
  shift: ["view"],
  location: ["view"],
  teamMember: ["view"],
  announcement: ["view"],
})

const roles = {
  owner,
  admin,
  manager,
  supervisor,
  employee,
  member: employee,
} as const

const assignableOrganizationRoles = [
  "admin",
  "manager",
  "supervisor",
  "employee",
] as const

type OrganizationRole = keyof typeof roles
type AssignableOrganizationRole = (typeof assignableOrganizationRoles)[number]

export { ac, assignableOrganizationRoles, roles }
export type { AssignableOrganizationRole, OrganizationRole }
