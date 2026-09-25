import { Link } from "@tanstack/react-router"
import { ChevronRightIcon } from "lucide-react"

import type { CompanyEmployeeListItem } from "@/features/company/types"
import { Badge } from "@/components/ui/badge"
import { CompanyEmployeeAvatar } from "@/features/company/components/company-employee-avatar"
import { getCompanyRoleLabel } from "@/features/company/utils/roles"
import { cn } from "@/lib/utils"

function CompanyEmployeeListRow({
  employee,
  workspaceSlug,
}: {
  employee: CompanyEmployeeListItem
  workspaceSlug: string
}) {
  return (
    <Link
      to="/app/$workspaceSlug/settings/company/$employeeId"
      params={{ employeeId: employee.id, workspaceSlug }}
      className="grid min-h-18 grid-cols-[2.5rem_minmax(0,1fr)_1rem] items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f8faff] focus-visible:bg-[#f8faff] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0968f5] md:grid-cols-[2.5rem_minmax(0,1.5fr)_0.7fr_0.7fr_0.6fr_1rem] md:px-5"
    >
      <CompanyEmployeeAvatar name={employee.name} />
      <span className="min-w-0">
        <strong className="block truncate text-sm font-semibold text-[#11245a]">
          {employee.name}
        </strong>
        <span className="mt-0.5 block truncate text-xs text-[#61709a]">
          {employee.email ?? "No email yet"}
        </span>
        <span className="mt-1 block text-xs text-[#61709a] md:hidden">
          {getCompanyRoleLabel(employee.role)} · {employee.activeLocationCount}/
          {employee.locationCount} active locations
        </span>
      </span>
      <Badge
        variant="outline"
        className={cn(
          "hidden w-fit rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold md:inline-flex",
          employee.role === "admin" || employee.role === "owner"
            ? "bg-[#eef3ff] text-[#0968f5]"
            : "bg-[#f2f5fb] text-[#405078]"
        )}
      >
        {getCompanyRoleLabel(employee.role)}
      </Badge>
      <span className="hidden truncate text-xs text-[#61709a] md:block">
        {employee.payrollId ?? "Not set"}
      </span>
      <span className="hidden text-xs text-[#61709a] md:block">
        {employee.activeLocationCount}/{employee.locationCount} active
      </span>
      <ChevronRightIcon className="size-4 text-[#7c87a8]" />
    </Link>
  )
}

export { CompanyEmployeeListRow }
