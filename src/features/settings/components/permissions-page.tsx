import { CheckIcon, MinusIcon } from "lucide-react"
import {
  permissionRoles,
  roleNames,
  rolePermissions,
} from "../constants/role-permissions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function PermissionValue({ value }: { value: boolean | string }) {
  if (typeof value === "string")
    return (
      <span className="relative inline-block text-xs whitespace-nowrap">
        {value}
      </span>
    )
  const Icon = value ? CheckIcon : MinusIcon
  return (
    <span className="inline-flex items-center justify-center">
      <Icon
        aria-hidden="true"
        className={
          value ? "size-4 text-primary" : "size-4 text-muted-foreground"
        }
      />
      <span className="sr-only">{value ? "Allowed" : "Not allowed"}</span>
    </span>
  )
}

function PermissionsPage() {
  return (
    <section className="min-w-0 space-y-4">
      <h1 className="text-2xl font-bold tracking-[-0.035em]">
        Role Permissions
      </h1>
      <div className="w-full max-w-full min-w-0 overflow-hidden rounded-xl border bg-card [&_[data-slot=table-container]]:overscroll-x-contain">
        <Table className="w-full min-w-[820px] table-fixed">
          <caption className="sr-only">Organization role permissions</caption>
          <colgroup>
            <col className="w-[220px]" />
            {permissionRoles.map((role) => (
              <col key={role} />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead
                scope="col"
                className="sticky left-0 z-10 bg-card px-4"
              >
                Capability
              </TableHead>
              {permissionRoles.map((role) => (
                <TableHead key={role} scope="col" className="text-center">
                  {roleNames[role]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rolePermissions.map((permission) => (
              <TableRow key={permission.label}>
                <TableHead
                  scope="row"
                  className="sticky left-0 z-10 bg-card px-4 py-3 whitespace-normal"
                >
                  {permission.label}
                </TableHead>
                {permissionRoles.map((role) => (
                  <TableCell key={role} className="text-center">
                    <PermissionValue value={permission.access(role)} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}

export { PermissionsPage }
