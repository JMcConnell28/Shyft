const adminRoles = ["owner", "developer", "support", "readonly"] as const

const adminPermissions = [
  "audit.read",
  "billing.trials.update",
  "clock_stations.manage",
  "errors.manage",
  "feature_flags.manage",
  "support.manage",
  "users.impersonate",
  "users.manage",
  "workspaces.read",
] as const

const adminRolePermissions = {
  owner: adminPermissions,
  developer: adminPermissions,
  support: [
    "audit.read",
    "clock_stations.manage",
    "errors.manage",
    "support.manage",
    "users.impersonate",
    "workspaces.read",
  ],
  readonly: ["audit.read", "workspaces.read"],
} satisfies Record<AdminRole, ReadonlyArray<AdminPermission>>

type AdminRole = (typeof adminRoles)[number]
type AdminPermission = (typeof adminPermissions)[number]

function roleHasAdminPermission(
  role: AdminRole,
  permission: AdminPermission,
) {
  return (adminRolePermissions[role] as ReadonlyArray<AdminPermission>).includes(
    permission,
  )
}

export {
  adminPermissions,
  adminRolePermissions,
  adminRoles,
  roleHasAdminPermission,
}
export type { AdminPermission, AdminRole }
