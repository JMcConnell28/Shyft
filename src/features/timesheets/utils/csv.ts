type CsvCell = string | number | boolean | null | undefined

function serializeCsv(rows: CsvCell[][]) {
  const body = rows
    .map((row) => row.map(serializeCsvCell).join(","))
    .join("\r\n")

  return `\uFEFF${body}`
}

function serializeCsvCell(cell: CsvCell) {
  const value = cell == null ? "" : String(cell)
  const escaped = value.replaceAll('"', '""')

  return `"${escaped}"`
}

export { serializeCsv }
export type { CsvCell }
