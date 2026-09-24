import {
  BanknoteIcon,
  IdCardIcon,
  MapPinIcon,
  ShieldCheckIcon,
  UserRoundXIcon,
} from "lucide-react"

import type {
  CompanyEmployeeDetail,
  CompanyEmployeeLocation,
} from "@/features/company/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CompanyEmployeeAvatar } from "@/features/company/components/company-employee-avatar"
import {
  getCompanyRoleLabel,
  isEditableCompanyRole,
} from "@/features/company/utils/roles"
import { SettingsSection } from "@/features/settings/components/settings-section"
import { formatEmployeeCompensation } from "@/features/staff-groups/utils/compensation"

function CompanyEmployeeProfileHeader({
  employee,
  workspaceName,
}: {
  employee: CompanyEmployeeDetail
  workspaceName: string
}) {
  return (
    <header className="flex items-center gap-3">
      <CompanyEmployeeAvatar name={employee.name} size="large" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-[1.75rem] leading-none font-extrabold tracking-[-0.045em] text-[#0d204f] md:text-3xl">
            {employee.name}
          </h1>
          {employee.offboardedAt ? (
            <Badge variant="secondary" className="rounded-full text-xs">
              Former employee
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 truncate text-sm font-medium text-[#61709a]">
          {employee.email ?? "No email yet"} · {workspaceName}
        </p>
      </div>
    </header>
  )
}

function CompanyEmployeeAccountSection({
  employee,
  onEditPay,
  onEditPayroll,
  onEditRole,
}: {
  employee: CompanyEmployeeDetail
  onEditPay: () => void
  onEditPayroll: () => void
  onEditRole: () => void
}) {
  return (
    <SettingsSection
      icon={ShieldCheckIcon}
      title="Account & payroll"
      description="Review this employee's permissions and payroll details."
    >
      <EmployeeSettingRow
        icon={ShieldCheckIcon}
        title="Account role"
        value={getCompanyRoleLabel(employee.role)}
        actionLabel="Change role"
        disabled={!isEditableCompanyRole(employee.role) || !employee.userId}
        onAction={onEditRole}
      />
      <EmployeeSettingRow
        icon={BanknoteIcon}
        title="Pay"
        value={formatEmployeeCompensation(employee.compensation)}
        actionLabel="Edit pay"
        onAction={onEditPay}
      />
      <EmployeeSettingRow
        icon={IdCardIcon}
        title="Payroll ID"
        value={employee.payrollId ?? "Not linked to Sage payroll"}
        actionLabel="Edit ID"
        onAction={onEditPayroll}
      />
    </SettingsSection>
  )
}

function EmployeeSettingRow({
  actionLabel,
  disabled,
  icon: Icon,
  onAction,
  title,
  value,
}: {
  actionLabel: string
  disabled?: boolean
  icon: typeof ShieldCheckIcon
  onAction: () => void
  title: string
  value: string
}) {
  return (
    <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="size-4 shrink-0 text-[#7c87a8]" />
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#14214a]">{title}</p>
          <p className="mt-0.5 truncate text-xs text-[#61709a]">{value}</p>
        </div>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 rounded-lg border-[#dfe5f0] px-3 text-xs font-semibold"
        disabled={disabled}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </div>
  )
}

function CompanyEmployeeLocationSection({
  employeeId,
  locations,
  pending,
  onSetActivity,
  onSetRotaVisibility,
}: {
  employeeId: string
  locations: Array<CompanyEmployeeLocation>
  pending: boolean
  onSetActivity: (input: {
    employeeId: string
    isActive: boolean
    targetLocationId: string
  }) => Promise<unknown>
  onSetRotaVisibility: (input: {
    employeeId: string
    showOnRota: boolean
    targetLocationId: string
  }) => Promise<unknown>
}) {
  return (
    <SettingsSection
      icon={MapPinIcon}
      title="Location activity"
      description="Choose where this employee is active and whether they appear on the rota."
    >
      {locations.length === 0 ? (
        <p className="py-4 text-xs text-[#61709a]">No locations assigned.</p>
      ) : (
        locations.map((location) => (
          <div
            key={location.id}
            className="grid gap-3 py-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
          >
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-[#14214a]">
                {location.name}
              </span>
              <span className="text-[11px] text-[#7180a2]">
                {location.isActive ? "Active" : "Inactive"}
              </span>
            </span>
            <label className="flex items-center justify-between gap-2 text-xs text-[#61709a] sm:justify-end">
              Active
              <Switch
                aria-label={`${location.name} activity`}
                checked={location.isActive}
                disabled={pending}
                onCheckedChange={(isActive) => {
                  void onSetActivity({
                    employeeId,
                    isActive,
                    targetLocationId: location.id,
                  })
                }}
              />
            </label>
            <label className="flex items-center justify-between gap-2 text-xs text-[#61709a] sm:justify-end">
              Show on rota
              <Switch
                aria-label={`Show ${location.name} member on rota`}
                checked={location.isActive && location.showOnRota}
                disabled={pending || !location.isActive}
                onCheckedChange={(showOnRota) => {
                  void onSetRotaVisibility({
                    employeeId,
                    showOnRota,
                    targetLocationId: location.id,
                  })
                }}
              />
            </label>
          </div>
        ))
      )}
    </SettingsSection>
  )
}

function CompanyEmployeeOffboardingSection({
  pending,
  onRemove,
}: {
  pending: boolean
  onRemove: () => void
}) {
  return (
    <SettingsSection
      icon={UserRoundXIcon}
      title="Access & offboarding"
      description="Revoke access while keeping the employee's history."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 py-4">
        <p className="max-w-lg text-xs leading-5 text-[#61709a]">
          Removes unstarted shifts. Historical rota, time, payroll and billing
          records remain available.
        </p>
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={onRemove}
        >
          Remove from organisation
        </Button>
      </div>
    </SettingsSection>
  )
}

export {
  CompanyEmployeeAccountSection,
  CompanyEmployeeLocationSection,
  CompanyEmployeeOffboardingSection,
  CompanyEmployeeProfileHeader,
}
