"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DataTable,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { useUserMutations } from "@/features/users/hooks/use-user-mutations"
import { useUsersQuery } from "@/features/users/hooks/use-users-query"
import { formatDateTime } from "@/lib/utils"

function UsersPage() {
  const [search, setSearch] = React.useState("")
  const query = useUsersQuery(search)
  const { impersonationMutation, statusMutation } = useUserMutations()

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-slate-500">
          Search app users, inspect access, and create audited read-only support
          sessions.
        </p>
      </header>
      <input
        className="h-10 w-full max-w-xl rounded-md border border-slate-200 bg-white px-3 text-sm"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by name or email"
        value={search}
      />
      {impersonationMutation.data ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Read-only impersonation link created</p>
          <a className="break-all underline" href={impersonationMutation.data.url}>
            {impersonationMutation.data.url}
          </a>
        </div>
      ) : null}
      <DataTable>
        <TableHead>
          <TableRow>
            <TableHeaderCell>User</TableHeaderCell>
            <TableHeaderCell>Roles</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Last login</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <tbody>
          {(query.data?.users ?? []).map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </TableCell>
              <TableCell>{user.roleSummary}</TableCell>
              <TableCell>
                <StatusBadge tone={user.deactivatedAt ? "danger" : "good"}>
                  {user.deactivatedAt ? "deactivated" : "active"}
                </StatusBadge>
              </TableCell>
              <TableCell>{formatDateTime(user.lastLoginAt)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      impersonationMutation.mutate({
                        reason: "Support investigation from admin console",
                        userId: user.id,
                      })
                    }
                    variant="secondary"
                  >
                    Impersonate
                  </Button>
                  <Button
                    onClick={() =>
                      statusMutation.mutate({
                        reason: "Updated from admin console",
                        status: user.deactivatedAt ? "active" : "deactivated",
                        userId: user.id,
                      })
                    }
                    variant={user.deactivatedAt ? "secondary" : "danger"}
                  >
                    {user.deactivatedAt ? "Activate" : "Deactivate"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  )
}

export { UsersPage }
