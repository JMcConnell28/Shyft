"use client"

import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  BanknoteIcon,
  ChevronLeftIcon,
  IdCardIcon,
  LoaderCircleIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
  UserRoundCheckIcon,
} from "lucide-react"

import type { AssignableOrganizationRole } from "@/lib/auth/permissions"
import type { CompanyEmployeeDetail } from "@/features/company/types"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { CompanyEmployeeRotaNotesCard } from "@/features/company/components/company-employee-rota-notes-card"
import { EmployeeCompensationDialog } from "@/features/staff-groups/components/employee-compensation-dialog"
import { useCompanyMutations } from "@/features/company/hooks/use-company-mutations"
import { useCompanyEmployeeQuery } from "@/features/company/hooks/use-company-query"
import {
  companyRoleDescriptions,
  editableCompanyRoles,
  getCompanyRoleLabel,
  isEditableCompanyRole,
} from "@/features/company/utils/roles"
import { formatEmployeeCompensation } from "@/features/staff-groups/utils/compensation"
import { getErrorMessage } from "@/lib/errors"

function CompanyEmployeeDetailPage({
  employeeId,
  organizationId,
  locationId,
  userId,
  workspaceSlug,
}: {
  employeeId: string
  organizationId?: string
  locationId?: string
  userId: string
  workspaceSlug: string
}) {
  const employeeQuery = useCompanyEmployeeQuery({
    employeeId,
    organizationId,
    locationId,
    userId,
  })
  const mutations = useCompanyMutations({ organizationId, locationId, userId })
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false)
  const [payDialogOpen, setPayDialogOpen] = React.useState(false)
  const [payrollDialogOpen, setPayrollDialogOpen] = React.useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false)
  const [rehireDialogOpen, setRehireDialogOpen] = React.useState(false)

  if (employeeQuery.isPending) {
    return (
      <EmployeeState icon={LoaderCircleIcon} message="Loading employee..." />
    )
  }

  if (employeeQuery.isError) {
    return (
      <EmployeeState
        icon={TriangleAlertIcon}
        message={getErrorMessage(
          employeeQuery.error,
          "We could not load that employee right now."
        )}
      />
    )
  }

  const employee = employeeQuery.data.employee
  const pending =
    mutations.roleMutation.isPending ||
    mutations.locationActivityMutation.isPending ||
    mutations.compensationMutation.isPending ||
    mutations.payrollIdMutation.isPending ||
    mutations.createRotaNoteMutation.isPending ||
    mutations.updateRotaNoteMutation.isPending ||
    mutations.archiveRotaNoteMutation.isPending ||
    mutations.removeEmployeeMutation.isPending ||
    mutations.rehireEmployeeMutation.isPending
  const isFormerEmployee = employee.offboardedAt !== null

  return (
    <div className="space-y-4 text-[#11245a]">
      <Link
        to="/w/$workspaceSlug/settings/company"
        params={{ workspaceSlug }}
        className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0069ff]"
      >
        <ChevronLeftIcon className="size-4" />
        Employees
      </Link>

      <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
        <div className="flex items-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-[#eef3ff] text-lg font-extrabold text-[#0069ff]">
            {getInitials(employee.name)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-extrabold tracking-[-0.04em]">
              {employee.name}
            </h2>
            <p className="mt-1 truncate text-sm font-semibold text-[#61709a]">
              {employee.email ?? "No email yet"} -{" "}
              {employeeQuery.data.workspaceName}
            </p>
            {isFormerEmployee ? (
              <span className="mt-2 inline-flex rounded-md bg-[#f2f5fb] px-2 py-1 text-xs font-extrabold text-[#405078]">
                Former employee
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {isFormerEmployee ? (
        <FormerEmployeeCard
          employee={employee}
          open={rehireDialogOpen}
          pending={pending}
          onOpenChange={setRehireDialogOpen}
          onRehire={async (locationIds) => {
            await mutations.rehireEmployeeMutation.mutateAsync({
              employeeId: employee.id,
              locationIds,
            })
          }}
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <DetailCard
              icon={ShieldCheckIcon}
              title="Account role"
              description={getCompanyRoleLabel(employee.role)}
              actionLabel="Change role"
              disabled={!isEditableCompanyRole(employee.role) || !employee.userId}
              onAction={() => setRoleDialogOpen(true)}
            />
            <DetailCard
              icon={BanknoteIcon}
              title="Pay"
              description={formatEmployeeCompensation(employee.compensation)}
              actionLabel="Edit pay"
              onAction={() => setPayDialogOpen(true)}
            />
            <DetailCard
              icon={IdCardIcon}
              title="Payroll ID"
              description={employee.payrollId ?? "Not linked to Sage payroll"}
              actionLabel="Edit ID"
              onAction={() => setPayrollDialogOpen(true)}
            />
          </div>

          <CompanyEmployeeRotaNotesCard
            employee={employee}
            pending={pending}
            onArchive={async (noteId) => {
              await mutations.archiveRotaNoteMutation.mutateAsync({
                employeeId: employee.id,
                noteId,
              })
            }}
            onCreate={async (note) => {
              await mutations.createRotaNoteMutation.mutateAsync({
                employeeId: employee.id,
                note,
              })
            }}
            onUpdate={async (noteId, note) => {
              await mutations.updateRotaNoteMutation.mutateAsync({
                employeeId: employee.id,
                note,
                noteId,
              })
            }}
          />

          <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
            <MapPinIcon className="size-5" />
          </span>
          <div>
            <h3 className="text-base font-extrabold tracking-[-0.03em]">
              Location activity
            </h3>
            <p className="mt-1 text-sm font-semibold text-[#61709a]">
              Choose where this employee is active for rotas, billing, and time
              tracking.
            </p>
          </div>
        </div>
        <div className="mt-4 divide-y divide-[#edf0f6]">
          {employee.locations.map((location) => (
            <label
              key={location.id}
              className="flex min-h-14 items-center justify-between gap-3 py-3"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold">
                  {location.name}
                </span>
                <span className="text-xs font-semibold text-[#61709a]">
                  {location.isActive ? "Active" : "Inactive"}
                </span>
              </span>
              <Switch
                checked={location.isActive}
                disabled={pending}
                onCheckedChange={(checked) => {
                  void mutations.locationActivityMutation.mutateAsync({
                    employeeId: employee.id,
                    isActive: checked,
                    targetLocationId: location.id,
                  })
                }}
              />
            </label>
          ))}
        </div>
          </section>

          {organizationId ? (
            <section className="rounded-xl border border-red-100 bg-red-50/40 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#9d1c1c]">
                    Access & offboarding
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-[#7d4a4a]">
                    Revoke access and clear unstarted shifts while preserving history.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending}
                  onClick={() => setRemoveDialogOpen(true)}
                >
                  Remove from organisation
                </Button>
              </div>
            </section>
          ) : null}
        </>
      )}

      <RoleDialog
        employee={employee}
        open={roleDialogOpen}
        pending={pending}
        onOpenChange={setRoleDialogOpen}
        onSave={async (role) => {
          await mutations.roleMutation.mutateAsync({
            employeeId: employee.id,
            role,
          })
        }}
      />
      <EmployeeCompensationDialog
        open={payDialogOpen}
        pending={pending}
        label={employee.name}
        initialCompensation={employee.compensation}
        onOpenChange={setPayDialogOpen}
        onSave={async (compensation) => {
          await mutations.compensationMutation.mutateAsync({
            compensation,
            employeeId: employee.id,
          })
        }}
      />
      <PayrollIdDialog
        employee={employee}
        open={payrollDialogOpen}
        pending={pending}
        onOpenChange={setPayrollDialogOpen}
        onSave={async (payrollId) => {
          await mutations.payrollIdMutation.mutateAsync({
            employeeId: employee.id,
            payrollId,
          })
        }}
      />
      <RemoveEmployeeDialog
        employeeName={employee.name}
        open={removeDialogOpen}
        pending={pending}
        onOpenChange={setRemoveDialogOpen}
        onRemove={async () => {
          await mutations.removeEmployeeMutation.mutateAsync({
            employeeId: employee.id,
          })
        }}
      />
    </div>
  )
}

function DetailCard({
  actionLabel,
  description,
  disabled,
  icon: Icon,
  onAction,
  title,
}: {
  actionLabel: string
  description: string
  disabled?: boolean
  icon: typeof ShieldCheckIcon
  onAction: () => void
  title: string
}) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold">{title}</p>
          <p className="mt-1 truncate text-sm font-semibold text-[#61709a]">
            {description}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 rounded-lg px-3 text-xs font-extrabold"
          disabled={disabled}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </section>
  )
}

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

function FormerEmployeeCard({
  employee,
  open,
  pending,
  onOpenChange,
  onRehire,
}: {
  employee: CompanyEmployeeDetail
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onRehire: (locationIds: Array<string>) => Promise<void>
}) {
  const [locationIds, setLocationIds] = React.useState<Array<string>>([])

  React.useEffect(() => {
    if (open) setLocationIds([])
  }, [open])

  function toggleLocation(locationId: string, checked: boolean) {
    setLocationIds((current) =>
      checked
        ? [...current, locationId]
        : current.filter((id) => id !== locationId)
    )
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#0069ff]">
          <UserRoundCheckIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold tracking-[-0.03em]">
            Rehire employee
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#61709a]">
            Restore employee access at the locations you choose. Their pay,
            payroll details, and history stay intact.
          </p>
        </div>
      </div>
      <Button
        type="button"
        className="mt-4"
        disabled={pending}
        onClick={() => onOpenChange(true)}
      >
        Rehire employee
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 sm:max-w-md">
          <DialogHeader className="p-5 pb-4">
            <DialogTitle>Rehire {employee.name}</DialogTitle>
            <DialogDescription>
              Choose at least one location. This restores employee-level
              access only; admin access and old future shifts are not restored.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 divide-y divide-[#edf0f6] overflow-y-auto px-5">
            {employee.locations.map((location) => {
              const checked = locationIds.includes(location.id)

              return (
                <label
                  key={location.id}
                  className="flex cursor-pointer items-center justify-between gap-3 py-3"
                >
                  <span className="text-sm font-extrabold">{location.name}</span>
                  <Checkbox
                    checked={checked}
                    disabled={pending}
                    onCheckedChange={(nextChecked) =>
                      toggleLocation(location.id, nextChecked)
                    }
                  />
                </label>
              )
            })}
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
              disabled={pending || locationIds.length === 0}
              onClick={() => {
                void onRehire(locationIds).then(() => onOpenChange(false))
              }}
            >
              {pending ? "Rehiring..." : "Rehire employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function RemoveEmployeeDialog({
  employeeName,
  open,
  pending,
  onOpenChange,
  onRemove,
}: {
  employeeName: string
  open: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onRemove: () => Promise<void>
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove {employeeName} from the organisation?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This revokes organisation and location access, and removes them
            from shifts that have not started. Their historical rota, time,
            payroll, and billing records will be kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() => {
              void onRemove().then(() => onOpenChange(false))
            }}
          >
            {pending ? "Removing..." : "Remove employee"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function EmployeeState({
  icon: Icon,
  message,
}: {
  icon: typeof LoaderCircleIcon
  message: string
}) {
  return (
    <section className="flex min-h-44 flex-col items-center justify-center rounded-xl bg-white p-6 text-center text-sm font-semibold text-[#61709a] shadow-[0_8px_24px_rgba(30,50,96,0.06)] ring-1 ring-[#e7eaf2]">
      <Icon className="mb-3 size-5 text-[#0069ff]" />
      {message}
    </section>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export { CompanyEmployeeDetailPage }
