import type {
  SageEmployeeImportMatch,
  SageEmployeeImportPreview,
} from "@/features/company/utils/sage-employee-import"

function SageEmployeeImportPreviewTable({
  preview,
}: {
  preview: SageEmployeeImportPreview
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <PreviewStat label="Rows" value={preview.matches.length} />
        <PreviewStat label="Updates" value={preview.updates.length} />
        <PreviewStat label="Skipped" value={preview.skippedCount} />
      </div>
      <div className="max-h-72 overflow-auto rounded-xl border border-[#edf0f6]">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-[#f8faff] text-[#61709a]">
            <tr>
              <th className="px-3 py-2 font-extrabold">Sage row</th>
              <th className="px-3 py-2 font-extrabold">Payroll ID</th>
              <th className="px-3 py-2 font-extrabold">Matched employee</th>
              <th className="px-3 py-2 font-extrabold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf0f6]">
            {preview.matches.map((match) => (
              <tr key={`${match.row.rowNumber}:${match.row.payrollId}`}>
                <td className="px-3 py-2 font-semibold">
                  {match.row.rowNumber}
                </td>
                <td className="px-3 py-2 font-semibold">
                  {match.row.payrollId}
                </td>
                <td className="px-3 py-2 font-semibold">
                  {match.employee?.name ?? match.row.fullName}
                </td>
                <td className="px-3 py-2 font-semibold">
                  {getMatchLabel(match.matchReason)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#f2f5fb] px-3 py-2">
      <p className="text-[11px] font-bold text-[#61709a]">{label}</p>
      <p className="mt-0.5 text-lg font-extrabold text-[#11245a]">{value}</p>
    </div>
  )
}

function getMatchLabel(matchReason: SageEmployeeImportMatch["matchReason"]) {
  switch (matchReason) {
    case "email":
      return "Matched by email"
    case "name":
      return "Matched by name"
    case "duplicate":
      return "Needs review"
    default:
      return "Unmatched"
  }
}

export { SageEmployeeImportPreviewTable }
