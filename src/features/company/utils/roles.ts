import type { CompanyRole } from "@/features/company/types"
import type { AssignableOrganizationRole } from "@/lib/auth/permissions"

const editableCompanyRoles = [
  "admin",
  "manager",
  "supervisor",
  "employee",
] as const satisfies ReadonlyArray<AssignableOrganizationRole>

const companyRoleDescriptions = {
  admin: "Full workspace access, settings, billing, and team management.",
  manager: "Can build, edit, and publish rotas for managed locations.",
  supervisor:
    "Can oversee rotas, timesheets, and attendance without editing rotas.",
  employee: "Can view their rota, view their timesheets, and clock in or out.",
} as const satisfies Record<AssignableOrganizationRole, string>

function getCompanyRoleLabel(role: CompanyRole | null) {
  if (!role) return "No account"
  if (role === "owner") return "Owner"
  if (role === "admin") return "Admin"
  if (role === "manager") return "Manager"
  if (role === "supervisor") return "Supervisor"
  if (role === "member" || role === "employee") return "Employee"

  return role
}

function isEditableCompanyRole(
  role: CompanyRole | null
): role is AssignableOrganizationRole {
  return (
    role !== "owner" &&
    editableCompanyRoles.includes(role as AssignableOrganizationRole)
  )
}

export {
  companyRoleDescriptions,
  editableCompanyRoles,
  getCompanyRoleLabel,
  isEditableCompanyRole,
}
