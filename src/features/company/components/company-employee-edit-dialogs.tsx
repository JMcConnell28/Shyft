"use client"

import * as React from "react"

import type { AssignableOrganizationRole } from "@/lib/auth/permissions"
import type { CompanyEmployeeDetail } from "@/features/company/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import {
  companyRoleDescriptions,
  editableCompanyRoles,
  getCompanyRoleLabel,
  isEditableCompanyRole,
} from "@/features/company/utils/roles"

function RoleDialog({
  employee,
  open,
  pending,
  onOpenChange,
  onSave,
}: {
  employee: CompanyEmployeeDetail
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSave: (role: AssignableOrganizationRole) => Promise<void>
}) {
  const initialRole = isEditableCompanyRole(employee.role)
    ? employee.role
    : "employee"
  const [role, setRole] =
    React.useState<AssignableOrganizationRole>(initialRole)

  React.useEffect(() => {
    if (open) setRole(initialRole)
  }, [initialRole, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-md">
        <DialogHeader className="p-5 pb-4">
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            Update what {employee.name} can access in this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 px-5 pb-5">
          <NativeSelect
            value={role}
            disabled={pending}
            onChange={(event) =>
              setRole(event.target.value as AssignableOrganizationRole)
            }
          >
            {editableCompanyRoles.map((option) => (
              <NativeSelectOption key={option} value={option}>
                {getCompanyRoleLabel(option)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <p className="rounded-xl bg-[#f5f8ff] px-3 py-2 text-sm font-semibold text-[#33477d]">
            {companyRoleDescriptions[role]}
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              void onSave(role).then(() => onOpenChange(false))
            }}
          >
            {pending ? "Saving..." : "Update role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PayrollIdDialog({
  employee,
  open,
  pending,
  onOpenChange,
  onSave,
}: {
  employee: CompanyEmployeeDetail
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onSave: (payrollId: string | null) => Promise<void>
}) {
  const [payrollId, setPayrollId] = React.useState(employee.payrollId ?? "")

  React.useEffect(() => {
    if (open) setPayrollId(employee.payrollId ?? "")
  }, [employee.payrollId, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-md">
        <DialogHeader className="p-5 pb-4">
          <DialogTitle>Edit payroll ID</DialogTitle>
          <DialogDescription>
            Set the Sage Employee Reference used for payroll exports.
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-5">
          <Input
            value={payrollId}
            disabled={pending}
            maxLength={40}
            placeholder="e.g. 42"
            onChange={(event) => setPayrollId(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              void onSave(payrollId.trim() || null).then(() =>
                onOpenChange(false)
              )
            }}
          >
            {pending ? "Saving..." : "Save payroll ID"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { PayrollIdDialog, RoleDialog }
