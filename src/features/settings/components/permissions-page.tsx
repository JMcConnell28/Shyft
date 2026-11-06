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
  if (typeof value === "string") return <span className="text-xs">{value}</span>
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
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Current organization permissions. This reference is visible only to
        owners; change individual roles in Company settings.
      </p>
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table className="min-w-[760px]">
          <caption className="sr-only">Organization role permissions</caption>
          <TableHeader>
            <TableRow>
              <TableHead
                scope="col"
                className="sticky left-0 z-10 min-w-48 bg-card px-4"
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
                  className="sticky left-0 bg-card px-4 py-3 whitespace-normal"
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
      <p className="text-xs text-muted-foreground">
        Location access, enabled features and subscription status still apply.
        “Member” is an older name for Employee. Owners cannot be reassigned
        through the normal role selector.
      </p>
    </section>
  )
}

export { PermissionsPage }
