import { LogOutIcon, UsersRoundIcon } from "lucide-react"

import type { ManagerClockEmployee } from "@/features/time-clock/types"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmployeeIdentity } from "@/features/time-clock/components/employee-identity"
import {
  TimeClockEmptyState,
  TimeClockPanel,
  TimeClockPanelHeader,
  TimeClockPill,
} from "@/features/time-clock/components/time-clock-panel"
import {
  formatElapsedSummary,
  getElapsedMilliseconds,
} from "@/features/time-clock/utils/elapsed-time"
import { formatClockTime } from "@/features/time-clock/utils/manager-clock-formatters"

type ClockedInEmployee = ManagerClockEmployee & {
  openEntry: NonNullable<ManagerClockEmployee["openEntry"]>
}

function ClockedInSection({
  employees,
  liveNow,
  onClockOut,
}: {
  employees: Array<ManagerClockEmployee>
  liveNow: Date
  onClockOut: (employee: ManagerClockEmployee) => void
}) {
  const clockedInEmployees = employees.filter(isClockedInEmployee)

  return (
    <TimeClockPanel>
      <TimeClockPanelHeader
        action={
          <TimeClockPill>
            {clockedInEmployees.length} live
          </TimeClockPill>
        }
        icon={UsersRoundIcon}
        subtitle="Live attendance across your locations"
        title="Currently clocked in"
      />
      {clockedInEmployees.length === 0 ? (
        <div className="p-4">
          <TimeClockEmptyState>No one is clocked in right now.</TimeClockEmptyState>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-[#edf0f6] bg-[#fafbfe] hover:bg-[#fafbfe]">
              <TableHead className="h-9 px-4 text-[11px] text-[#7481a0]">
                Employee
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[#7481a0]">
                Location
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[#7481a0]">
                Clocked in
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[#7481a0]">
                Duration
              </TableHead>
              <TableHead className="h-9 pr-4 text-right text-[11px] text-[#7481a0]">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clockedInEmployees.map((employee) => (
              <TableRow
                className="border-[#edf0f6] hover:bg-[#fafcff]"
                key={`${employee.locationId}:${employee.id}`}
              >
                <TableCell className="px-4 py-3">
                  <EmployeeIdentity
                    name={employee.name}
                    secondary={employee.email ?? undefined}
                  />
                </TableCell>
                <TableCell className="font-medium text-[#536186]">
                  {employee.locationName}
                </TableCell>
                <TableCell className="font-medium text-[#536186]">
                  {formatClockTime(employee.openEntry.clockedInAt)}
                </TableCell>
                <TableCell>
                  <span className="inline-flex rounded-lg bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                    {formatElapsedSummary(
                      getElapsedMilliseconds(
                        employee.openEntry.clockedInAt,
                        liveNow
                      )
                    )}
                  </span>
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Button
                    className="h-8 rounded-lg border-[#dfe4ef] bg-white px-3 text-[#33456f] shadow-none hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => onClockOut(employee)}
                    size="sm"
                    variant="outline"
                  >
                    <LogOutIcon className="size-3.5" />
                    Clock out
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TimeClockPanel>
  )
}

function isClockedInEmployee(
  employee: ManagerClockEmployee
): employee is ClockedInEmployee {
  return employee.openEntry !== null
}

export { ClockedInSection }
