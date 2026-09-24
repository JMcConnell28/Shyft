"use client"

import * as React from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import {
  CompanyEmployeeAccountSection,
  CompanyEmployeeLocationSection,
  CompanyEmployeeOffboardingSection,
  CompanyEmployeeProfileHeader,
} from "@/features/company/components/company-employee-detail-sections"
import {
  PayrollIdDialog,
  RoleDialog,
} from "@/features/company/components/company-employee-edit-dialogs"
import {
  FormerEmployeeSection,
  RemoveEmployeeDialog,
} from "@/features/company/components/company-employee-lifecycle"
import { CompanyEmployeeRotaNotesCard } from "@/features/company/components/company-employee-rota-notes-card"
import { useCompanyMutations } from "@/features/company/hooks/use-company-mutations"
import { useCompanyEmployeeQuery } from "@/features/company/hooks/use-company-query"
import { EmployeeCompensationDialog } from "@/features/staff-groups/components/employee-compensation-dialog"
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
    return <EmployeeState message="Loading employee..." />
  }
  if (employeeQuery.isError) {
    return (
      <EmployeeState
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
    mutations.rotaVisibilityMutation.isPending ||
    mutations.compensationMutation.isPending ||
    mutations.payrollIdMutation.isPending ||
    mutations.createRotaNoteMutation.isPending ||
    mutations.updateRotaNoteMutation.isPending ||
    mutations.archiveRotaNoteMutation.isPending ||
    mutations.removeEmployeeMutation.isPending ||
    mutations.rehireEmployeeMutation.isPending

  return (
    <div className="space-y-5 text-[#11245a]">
      <Link
        to="/w/$workspaceSlug/settings/company"
        params={{ workspaceSlug }}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#61709a] transition-colors hover:text-[#0968f5]"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to employees
      </Link>

      <CompanyEmployeeProfileHeader
        employee={employee}
        workspaceName={employeeQuery.data.workspaceName}
      />

      {employee.offboardedAt ? (
        <FormerEmployeeSection
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
          <CompanyEmployeeAccountSection
            employee={employee}
            onEditRole={() => setRoleDialogOpen(true)}
            onEditPay={() => setPayDialogOpen(true)}
            onEditPayroll={() => setPayrollDialogOpen(true)}
          />
          <CompanyEmployeeLocationSection
            employeeId={employee.id}
            locations={employee.locations}
            pending={pending}
            onSetActivity={(input) =>
              mutations.locationActivityMutation.mutateAsync(input)
            }
            onSetRotaVisibility={(input) =>
              mutations.rotaVisibilityMutation.mutateAsync(input)
            }
          />
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
          {organizationId ? (
            <CompanyEmployeeOffboardingSection
              pending={pending}
              onRemove={() => setRemoveDialogOpen(true)}
            />
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

function EmployeeState({ message }: { message: string }) {
  return (
    <section className="rounded-xl border border-[#dfe5f0] bg-white p-6 text-center text-sm font-medium text-[#61709a]">
      {message}
    </section>
  )
}

export { CompanyEmployeeDetailPage }
