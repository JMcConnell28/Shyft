import { csvNumericValueSchema } from "@/features/timesheets/schemas/csv-schemas"

type NumericCsvCell = { kind: "numeric"; value: string }
type CsvCell = string | number | boolean | null | undefined | NumericCsvCell

function numericCsvCell(value: string): NumericCsvCell {
  return { kind: "numeric", value: csvNumericValueSchema.parse(value) }
}

function serializeCsv(rows: Array<Array<CsvCell>>): string {
  const body = rows
    .map((row) => row.map(serializeCsvCell).join(","))
    .join("\r\n")

  return `\uFEFF${body}`
}

function serializeCsvCell(cell: CsvCell): string {
  const value =
    cell == null
      ? ""
      : typeof cell === "object"
        ? csvNumericValueSchema.parse(cell.value)
        : String(cell)
  if (typeof cell === "number" && !Number.isFinite(cell))
    throw new Error("Export numbers must be finite.")
  if (
    typeof cell === "string" &&
    (/^[\s\p{Cc}]*[=+\-@＝＋－＠]/u.test(cell) ||
      /^[\s\p{Cc}]*[\t\r\n]/u.test(cell))
  ) {
    throw new Error(
      "A payroll text field starts with a spreadsheet formula character. Update it before exporting."
    )
  }
  const escaped = value.replaceAll('"', '""')

  return `"${escaped}"`
}

export { serializeCsv, numericCsvCell }
export type { CsvCell }
