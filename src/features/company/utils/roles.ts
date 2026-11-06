import type { CompanyRole } from "@/features/company/types"
import type { AssignableOrganizationRole } from "@/lib/auth/permissions"

const editableCompanyRoles = [
  "admin",
  "manager",
  "supervisor",
  "employee",
] as const satisfies ReadonlyArray<AssignableOrganizationRole>

const companyRoleDescriptions = {
  admin:
    "Manage organization settings, staff, join requests, and rotas. Billing remains owner-only.",
  manager: "Can build, edit, and publish rotas for managed locations.",
  supervisor:
    "Can make manual clock-ins and clock-outs and view their own timesheets. Cannot view other employees’ timesheets or edit rotas.",
  employee: "Can view their rota, view their timesheets, and clock in or out.",
} as const satisfies Record<AssignableOrganizationRole, string>

function getCompanyRoleLabel(role: CompanyRole | null) {
  if (!role) return "No account"
  if (role === "owner") return "Owner"
  if (role === "admin") return "Admin"
  if (role === "manager") return "Manager"
  if (role === "supervisor") return "Supervisor"
  return "Employee"
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
