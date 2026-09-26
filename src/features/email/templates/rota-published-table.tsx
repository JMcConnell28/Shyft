import type { RotaPublishedShift } from "@/features/email/types/rota-published"
import {
  table,
  tableCell,
  tableHeader,
  tableMutedCell,
} from "@/features/email/templates/rota-published-styles"
import {
  buildRotaPublishedDays,
  formatRotaPublishedHours,
} from "@/features/email/utils/rota-published-schedule"

type RotaPublishedTableProps = {
  shifts: Array<RotaPublishedShift>
  weekStart: string
}

function RotaPublishedTable({ shifts, weekStart }: RotaPublishedTableProps) {
  const days = buildRotaPublishedDays(weekStart, shifts)

  return (
    <table style={table}>
      <thead>
        <tr>
          <th scope="col" style={{ ...tableHeader, width: "23%" }}>
            Day
          </th>
          <th scope="col" style={{ ...tableHeader, width: "25%" }}>
            Role / zone
          </th>
          <th scope="col" style={{ ...tableHeader, width: "35%" }}>
            Time
          </th>
          <th scope="col" style={{ ...tableHeader, width: "17%" }}>
            Hours
          </th>
        </tr>
      </thead>
      <tbody>
        {days.flatMap((day) =>
          day.shifts.length === 0
            ? [
                <tr key={day.dayDate}>
                  <td style={tableCell}>{day.label}</td>
                  <td style={tableMutedCell}>Off</td>
                  <td style={tableMutedCell}>—</td>
                  <td style={tableMutedCell}>—</td>
                </tr>,
              ]
            : day.shifts.map((shift, index) => (
                <tr key={`${day.dayDate}-${index}`}>
                  <td style={tableCell}>{index === 0 ? day.label : ""}</td>
                  <td style={tableCell}>{shift.zoneName ?? "Shift"}</td>
                  <td style={tableCell}>{shift.timeLabel}</td>
                  <td style={tableCell}>
                    {formatRotaPublishedHours(shift.durationMinutes)}h
                  </td>
                </tr>
              ))
        )}
      </tbody>
    </table>
  )
}

export { RotaPublishedTable }
